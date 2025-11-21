/**
 * Room Repository Interface for homestay rooms
 */
import { Room } from "../entities/room.entity";
import { RoomId } from "../value-objects/room-id.vo";

export const ROOM_REPOSITORY = "ROOM_REPOSITORY";

export interface IRoomRepository {
  save(room: Room): Promise<void>;
  findById(id: RoomId): Promise<Room | null>;
  findByAccommodationId(accommodationId: string): Promise<Room[]>;
  lockById(id: RoomId): Promise<Room | null>;
  findMany(
    limit: number,
    offset: number,
    filters?: {
      accommodationId?: string;
      status?: string;
    },
  ): Promise<Room[]>;
  count(filters?: {
    accommodationId?: string;
    status?: string;
  }): Promise<number>;
}
