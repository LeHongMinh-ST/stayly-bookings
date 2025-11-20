/**
 * DeleteAccommodationHandler
 * Handles DeleteAccommodationCommand
 */
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  NotFoundException,
} from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteAccommodationCommand } from "../delete-accommodation.command";
import { ACCOMMODATION_REPOSITORY } from "../../../domain/repositories/accommodation.repository.interface";
import type { IAccommodationRepository } from "../../../domain/repositories/accommodation.repository.interface";
import { AccommodationId } from "../../../domain/value-objects/accommodation-id.vo";
import type { IUserAuthorizationPort } from "../../interfaces/user-authorization.port";
import { USER_AUTHORIZATION_PORT } from "../../interfaces/user-authorization.port";
import type { IAccommodationBookingPolicyPort } from "../../interfaces/accommodation-booking-policy.port";
import { ACCOMMODATION_BOOKING_POLICY_PORT } from "../../interfaces/accommodation-booking-policy.port";

const UPCOMING_BOOKING_LOOKAHEAD_DAYS = 30;

@CommandHandler(DeleteAccommodationCommand)
export class DeleteAccommodationHandler
  implements ICommandHandler<DeleteAccommodationCommand, void>
{
  constructor(
    @Inject(ACCOMMODATION_REPOSITORY)
    private readonly accommodationRepo: IAccommodationRepository,
    @Inject(USER_AUTHORIZATION_PORT)
    private readonly userAuthorization: IUserAuthorizationPort,
    @Inject(ACCOMMODATION_BOOKING_POLICY_PORT)
    private readonly bookingPolicy: IAccommodationBookingPolicyPort,
  ) {}

  async execute(command: DeleteAccommodationCommand): Promise<void> {
    const accommodationId = AccommodationId.create(command.id);
    const accommodation =
      await this.accommodationRepo.findById(accommodationId);

    if (!accommodation) {
      throw new NotFoundException(
        `Accommodation with ID ${command.id} not found`,
      );
    }

    const isOwner = accommodation.getOwnerId() === command.ownerId;
    const isSuperAdmin = await this.userAuthorization.isSuperAdmin(
      command.ownerId,
    );

    if (!isOwner && !isSuperAdmin) {
      throw new ForbiddenException(
        "You do not have permission to delete this accommodation",
      );
    }

    if (!accommodation.canBeDeleted()) {
      throw new BadRequestException(
        "Only suspended or inactive accommodations can be deleted",
      );
    }

    const hasUpcomingBookings = await this.bookingPolicy.hasUpcomingBookings(
      command.id,
      UPCOMING_BOOKING_LOOKAHEAD_DAYS,
    );

    if (hasUpcomingBookings) {
      throw new BadRequestException(
        `Accommodation has bookings scheduled in the next ${UPCOMING_BOOKING_LOOKAHEAD_DAYS} days`,
      );
    }

    await this.accommodationRepo.delete(accommodationId);
  }
}
