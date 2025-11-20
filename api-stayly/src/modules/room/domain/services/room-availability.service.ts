/**
 * RoomAvailabilityService centralizes availability validation.
 * Pure domain service, no infrastructure dependencies.
 */
import {
  InvalidStateError,
  NotFoundError,
} from "../../../../common/domain/errors";
import { IRoomRepository } from "../repositories/room.repository.interface";
import { IRoomTypeRepository } from "../repositories/room-type.repository.interface";
import { RoomId } from "../value-objects/room-id.vo";
import { RoomTypeId } from "../value-objects/room-type-id.vo";
import { HotelRoomId } from "../value-objects/hotel-room-id.vo";
import { HotelRoomStatus } from "../value-objects/hotel-room-status.vo";

export class RoomAvailabilityService {
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly roomTypeRepository: IRoomTypeRepository,
  ) {}

  async ensureHomestayRoomIsBookable(roomId: RoomId): Promise<void> {
    const room = await this.roomRepository.findById(roomId);
    if (!room) {
      throw new NotFoundError("Room not found");
    }

    if (!room.getStatus().isActive()) {
      throw new InvalidStateError("Room is not active for booking");
    }
  }

  async ensureRoomTypeHasInventory(roomTypeId: RoomTypeId): Promise<void> {
    const roomType = await this.roomTypeRepository.findById(roomTypeId);
    if (!roomType) {
      throw new NotFoundError("Room type not found");
    }

    if (!roomType.getStatus().isActive()) {
      throw new InvalidStateError("Room type is not active for booking");
    }

    if (roomType.getRooms().length >= roomType.getInventory().value()) {
      throw new InvalidStateError("Room type inventory exhausted");
    }
  }

  async ensureHotelRoomIsAssignable(hotelRoomId: HotelRoomId): Promise<void> {
    const room = await this.roomTypeRepository.findHotelRoomById(hotelRoomId);
    if (!room) {
      throw new NotFoundError("Hotel room not found");
    }

    if (room.getStatus().value() !== HotelRoomStatus.AVAILABLE) {
      throw new InvalidStateError("Hotel room is not available");
    }
  }
}
