/**
 * RoomType Repository Interface for hotel room management
 */
import { RoomType } from "../entities/room-type.entity";
import { RoomTypeId } from "../value-objects/room-type-id.vo";
import { Room } from "../entities/room.entity";
import { HotelRoom } from "../entities/hotel-room.entity";
import { HotelRoomId } from "../value-objects/hotel-room-id.vo";

export const ROOM_TYPE_REPOSITORY = "ROOM_TYPE_REPOSITORY";

export interface IRoomTypeRepository {
  save(roomType: RoomType): Promise<void>;
  findById(id: RoomTypeId): Promise<RoomType | null>;
  findByHotelId(hotelId: string): Promise<RoomType[]>;
  lockById(id: RoomTypeId): Promise<RoomType | null>;

  saveHotelRoom(room: HotelRoom): Promise<void>;
  findHotelRoomById(id: HotelRoomId): Promise<HotelRoom | null>;
  findHotelRoomsByType(roomTypeId: RoomTypeId): Promise<HotelRoom[]>;
  lockHotelRoomById(id: HotelRoomId): Promise<HotelRoom | null>;

  /**
   * Homestay rooms live in IRoomRepository but queries occasionally require joins.
   * This optional helper allows optimized cross-select queries when needed.
   */
  findRoomOverviewForAccommodation(accommodationId: string): Promise<Room[]>;
}
