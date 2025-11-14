/**
 * CreateAccommodationHandler
 * Handles CreateAccommodationCommand
 */

import { CommandHandler, ICommandHandler, EventBus } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { CreateAccommodationCommand } from "../create-accommodation.command";
import { Accommodation } from "../../../domain/entities/accommodation.entity";
import { ACCOMMODATION_REPOSITORY } from "../../../domain/repositories/accommodation.repository.interface";
import type { IAccommodationRepository } from "../../../domain/repositories/accommodation.repository.interface";
import { Address } from "../../../domain/value-objects/address.vo";
import { Location } from "../../../domain/value-objects/location.vo";
import { Policies } from "../../../domain/value-objects/policies.vo";
import {
  CancellationPolicy,
  CancellationPolicyType,
} from "../../../domain/value-objects/cancellation-policy.vo";
import { AccommodationResponseDto } from "../../dto/response/accommodation-response.dto";
import { AccommodationDtoMapper } from "../../../infrastructure/persistence/mappers/accommodation-dto.mapper";

@CommandHandler(CreateAccommodationCommand)
export class CreateAccommodationHandler
  implements ICommandHandler<CreateAccommodationCommand>
{
  constructor(
    @Inject(ACCOMMODATION_REPOSITORY)
    private readonly accommodationRepo: IAccommodationRepository,
    private readonly eventBus: EventBus,
    private readonly dtoMapper: AccommodationDtoMapper,
  ) {}

  async execute(
    command: CreateAccommodationCommand,
  ): Promise<AccommodationResponseDto> {
    // Create value objects
    const address = Address.create(command.address);
    const location = Location.create(
      command.location.latitude,
      command.location.longitude,
    );
    const policies = Policies.create(command.policies);
    const cancellationPolicy = CancellationPolicy.create({
      type: command.cancellationPolicy.type as CancellationPolicyType,
      freeCancellationDays: command.cancellationPolicy.freeCancellationDays,
      refundPercentage: command.cancellationPolicy.refundPercentage,
    });

    // Create domain entity
    const accommodation = Accommodation.create({
      type: command.type,
      name: command.name,
      ownerId: command.ownerId,
      address,
      location,
      description: command.description,
      images: command.images,
      amenities: command.amenities,
      policies,
      cancellationPolicy,
    });

    // Persist
    await this.accommodationRepo.save(accommodation);

    // Publish domain events
    const domainEvents = accommodation.pullDomainEvents();
    domainEvents.forEach((event) => {
      this.eventBus.publish(event);
    });

    // Map to DTO
    return this.dtoMapper.toDto(accommodation);
  }
}
