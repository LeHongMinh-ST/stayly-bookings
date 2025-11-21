/**
 * CreateRoomTypeHandler
 * Handles CreateRoomTypeCommand for hotel room types
 */

import { CommandHandler, ICommandHandler, EventBus } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { CreateRoomTypeCommand } from "../create-room-type.command";
import { RoomType } from "../../../domain/entities/room-type.entity";
import { ROOM_TYPE_REPOSITORY } from "../../../domain/repositories/room-type.repository.interface";
import type { IRoomTypeRepository } from "../../../domain/repositories/room-type.repository.interface";
import {
  RoomTypeCategoryVO,
  RoomTypeCategory,
} from "../../../domain/value-objects/room-type.vo";
import { BedTypeVO, BedType } from "../../../domain/value-objects/bed-type.vo";
import { GuestCapacityVO } from "../../../domain/value-objects/guest-capacity.vo";
import { RoomInventoryVO } from "../../../domain/value-objects/room-inventory.vo";
import {
  RoomImageVO,
  RoomImageType,
} from "../../../domain/value-objects/room-image.vo";
import { MoneyVO } from "../../../domain/value-objects/money.vo";
import { RoomTypeResponseDto } from "../../dto/response/room-type-response.dto";
import { RoomDtoMapper } from "../../../infrastructure/persistence/mappers/room-dto.mapper";

@CommandHandler(CreateRoomTypeCommand)
export class CreateRoomTypeHandler
  implements ICommandHandler<CreateRoomTypeCommand>
{
  constructor(
    @Inject(ROOM_TYPE_REPOSITORY)
    private readonly roomTypeRepository: IRoomTypeRepository,
    private readonly eventBus: EventBus,
    private readonly dtoMapper: RoomDtoMapper,
  ) {}

  async execute(command: CreateRoomTypeCommand): Promise<RoomTypeResponseDto> {
    // Create value objects
    const category = RoomTypeCategoryVO.create(
      command.category as RoomTypeCategory,
    );
    const bedType = BedTypeVO.create(command.bedType as BedType);
    const capacity = GuestCapacityVO.create({
      maxAdults: command.capacity.maxAdults,
      maxChildren: command.capacity.maxChildren,
    });
    const inventory = RoomInventoryVO.create(command.inventory);
    const images = command.images.map((img) =>
      RoomImageVO.create({
        url: img.url,
        type: img.type as RoomImageType,
        order: img.order,
      }),
    );
    const basePrice = MoneyVO.create({
      amount: command.basePrice.amount,
      currency: command.basePrice.currency,
    });

    // Create domain entity
    const roomType = RoomType.create({
      hotelId: command.hotelId,
      name: command.name,
      category,
      area: command.area,
      capacity,
      bedCount: command.bedCount,
      bedType,
      description: command.description,
      amenities: command.amenities,
      images,
      inventory,
      basePrice,
      viewDirection: command.viewDirection,
    });

    // Persist
    await this.roomTypeRepository.save(roomType);

    // Publish domain events
    const domainEvents = roomType.pullDomainEvents();
    domainEvents.forEach((event) => {
      this.eventBus.publish(event);
    });

    // Map to DTO
    return this.dtoMapper.toRoomTypeDto(roomType);
  }
}
