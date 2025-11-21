/**
 * CreateHotelRoomHandler
 * Handles CreateHotelRoomCommand for physical hotel rooms
 */

import { CommandHandler, ICommandHandler, EventBus } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { CreateHotelRoomCommand } from "../create-hotel-room.command";
import { ROOM_TYPE_REPOSITORY } from "../../../domain/repositories/room-type.repository.interface";
import type { IRoomTypeRepository } from "../../../domain/repositories/room-type.repository.interface";
import { RoomTypeId } from "../../../domain/value-objects/room-type-id.vo";
import { RoomNumberVO } from "../../../domain/value-objects/room-number.vo";
import { HotelRoomResponseDto } from "../../dto/response/hotel-room-response.dto";
import { NotFoundError } from "../../../../../common/domain/errors";

@CommandHandler(CreateHotelRoomCommand)
export class CreateHotelRoomHandler
  implements ICommandHandler<CreateHotelRoomCommand>
{
  constructor(
    @Inject(ROOM_TYPE_REPOSITORY)
    private readonly roomTypeRepository: IRoomTypeRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(
    command: CreateHotelRoomCommand,
  ): Promise<HotelRoomResponseDto> {
    // Find room type
    const roomTypeId = RoomTypeId.create(command.roomTypeId);
    const roomType = await this.roomTypeRepository.findById(roomTypeId);

    if (!roomType) {
      throw new NotFoundError("RoomType", command.roomTypeId);
    }

    // Create value objects
    const roomNumber = RoomNumberVO.create(command.roomNumber);

    // Create hotel room through room type aggregate
    const hotelRoom = roomType.createHotelRoom({
      roomNumber,
      floorId: command.floorId,
      notes: command.notes,
    });

    // Persist room type (which includes the new hotel room)
    await this.roomTypeRepository.save(roomType);
    await this.roomTypeRepository.saveHotelRoom(hotelRoom);

    // Publish domain events
    const domainEvents = roomType.pullDomainEvents();
    domainEvents.forEach((event) => {
      this.eventBus.publish(event);
    });

    // Map to DTO
    return {
      id: hotelRoom.getId().getValue(),
      roomTypeId: hotelRoom.getRoomTypeId().getValue(),
      roomNumber: hotelRoom.getRoomNumber().getValue(),
      floorId: hotelRoom.getFloorId(),
      status: hotelRoom.getStatus().value(),
      notes: hotelRoom.getNotes(),
    };
  }
}
