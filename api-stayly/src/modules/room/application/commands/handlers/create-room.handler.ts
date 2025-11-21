/**
 * CreateRoomHandler
 * Handles CreateRoomCommand for homestay rooms
 */

import { CommandHandler, ICommandHandler, EventBus } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { CreateRoomCommand } from "../create-room.command";
import { Room } from "../../../domain/entities/room.entity";
import { ROOM_REPOSITORY } from "../../../domain/repositories/room.repository.interface";
import type { IRoomRepository } from "../../../domain/repositories/room.repository.interface";
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
import { RoomResponseDto } from "../../dto/response/room-response.dto";
import { RoomDtoMapper } from "../../../infrastructure/persistence/mappers/room-dto.mapper";

@CommandHandler(CreateRoomCommand)
export class CreateRoomHandler implements ICommandHandler<CreateRoomCommand> {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    private readonly eventBus: EventBus,
    private readonly dtoMapper: RoomDtoMapper,
  ) {}

  async execute(command: CreateRoomCommand): Promise<RoomResponseDto> {
    // Create value objects
    const category = RoomTypeCategoryVO.create(
      command.category as RoomTypeCategory,
    );
    const bedType = BedTypeVO.create(command.bedType as BedType);
    const guestCapacity = GuestCapacityVO.create({
      maxAdults: command.guestCapacity.maxAdults,
      maxChildren: command.guestCapacity.maxChildren,
    });
    const inventory = RoomInventoryVO.create(command.inventory);
    const images = command.images.map((img) =>
      RoomImageVO.create({
        url: img.url,
        type: img.type as RoomImageType,
        order: img.order,
      }),
    );

    let basePrice: MoneyVO | undefined;
    if (command.basePrice) {
      basePrice = MoneyVO.create({
        amount: command.basePrice.amount,
        currency: command.basePrice.currency,
      });
    }

    // Create domain entity
    const room = Room.create({
      accommodationId: command.accommodationId,
      name: command.name,
      category,
      area: command.area,
      guestCapacity,
      bedCount: command.bedCount,
      bedType,
      description: command.description,
      amenities: command.amenities,
      images,
      inventory,
      basePrice,
    });

    // Persist
    await this.roomRepository.save(room);

    // Publish domain events
    const domainEvents = room.pullDomainEvents();
    domainEvents.forEach((event) => {
      this.eventBus.publish(event);
    });

    // Map to DTO
    return this.dtoMapper.toRoomDto(room);
  }
}
