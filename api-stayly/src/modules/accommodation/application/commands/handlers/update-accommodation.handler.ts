/**
 * UpdateAccommodationHandler
 * Handles UpdateAccommodationCommand
 */

import { CommandHandler, ICommandHandler, EventBus } from "@nestjs/cqrs";
import { Inject, NotFoundException, ForbiddenException } from "@nestjs/common";
import { UpdateAccommodationCommand } from "../update-accommodation.command";
import { UpdateAccommodationProps } from "../../../domain/entities/accommodation.entity";
import { ACCOMMODATION_REPOSITORY } from "../../../domain/repositories/accommodation.repository.interface";
import type { IAccommodationRepository } from "../../../domain/repositories/accommodation.repository.interface";
import { AccommodationId } from "../../../domain/value-objects/accommodation-id.vo";
import { Address } from "../../../domain/value-objects/address.vo";
import { Location } from "../../../domain/value-objects/location.vo";
import { Policies } from "../../../domain/value-objects/policies.vo";
import {
  CancellationPolicy,
  CancellationPolicyType,
} from "../../../domain/value-objects/cancellation-policy.vo";
import { AccommodationResponseDto } from "../../dto/response/accommodation-response.dto";
import { AccommodationDtoMapper } from "../../../infrastructure/persistence/mappers/accommodation-dto.mapper";
import type { IUserAuthorizationPort } from "../../interfaces/user-authorization.port";
import { USER_AUTHORIZATION_PORT } from "../../interfaces/user-authorization.port";

@CommandHandler(UpdateAccommodationCommand)
export class UpdateAccommodationHandler
  implements ICommandHandler<UpdateAccommodationCommand>
{
  constructor(
    @Inject(ACCOMMODATION_REPOSITORY)
    private readonly accommodationRepo: IAccommodationRepository,
    private readonly eventBus: EventBus,
    private readonly dtoMapper: AccommodationDtoMapper,
    @Inject(USER_AUTHORIZATION_PORT)
    private readonly userAuthorization: IUserAuthorizationPort,
  ) {}

  async execute(
    command: UpdateAccommodationCommand,
  ): Promise<AccommodationResponseDto> {
    // 1. Find accommodation
    const accommodationId = AccommodationId.create(command.id);
    const accommodation =
      await this.accommodationRepo.findById(accommodationId);

    if (!accommodation) {
      throw new NotFoundException(
        `Accommodation with ID ${command.id} not found`,
      );
    }

    // 2. Check ownership (skip when actor owns super admin capability)
    const isOwner = accommodation.getOwnerId() === command.ownerId;
    const isSuperAdmin = await this.userAuthorization.isSuperAdmin(
      command.ownerId,
    );

    if (!isOwner && !isSuperAdmin) {
      throw new ForbiddenException(
        "You do not have permission to update this accommodation",
      );
    }

    // 3. Prepare update props
    const updateProps: UpdateAccommodationProps = {};

    if (command.name) updateProps.name = command.name;
    if (command.description) updateProps.description = command.description;
    if (command.images) updateProps.images = command.images;
    if (command.amenities) updateProps.amenities = command.amenities;
    if (command.starRating !== undefined)
      updateProps.starRating = command.starRating;

    if (command.address) {
      updateProps.address = Address.create(command.address);
    }

    if (command.location) {
      updateProps.location = Location.create(
        command.location.latitude,
        command.location.longitude,
      );
    }

    if (command.policies) {
      updateProps.policies = Policies.create(command.policies);
    }

    if (command.cancellationPolicy) {
      updateProps.cancellationPolicy = CancellationPolicy.create({
        type: command.cancellationPolicy.type as CancellationPolicyType,
        freeCancellationDays: command.cancellationPolicy.freeCancellationDays,
        refundPercentage: command.cancellationPolicy.refundPercentage,
      });
    }

    // 4. Update domain entity
    accommodation.update(updateProps);

    // 5. Persist
    await this.accommodationRepo.save(accommodation);

    // 6. Publish domain events
    const domainEvents = accommodation.pullDomainEvents();
    domainEvents.forEach((event) => {
      this.eventBus.publish(event);
    });

    // 7. Map to DTO
    return this.dtoMapper.toDto(accommodation);
  }
}
