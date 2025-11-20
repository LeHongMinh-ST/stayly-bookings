/**
 * RoomFactory centralizes creation logic for aggregates to keep handlers slim.
 */
import { Room, CreateRoomProps } from "../entities/room.entity";
import { RoomType, CreateRoomTypeProps } from "../entities/room-type.entity";
import { HotelRoom } from "../entities/hotel-room.entity";
import { RoomNumberVO } from "../value-objects/room-number.vo";
import { RoomTypeId } from "../value-objects/room-type-id.vo";

export class RoomFactoryService {
  createHomestayRoom(props: CreateRoomProps): Room {
    return Room.create(props);
  }

  createHotelRoomType(props: CreateRoomTypeProps): RoomType {
    return RoomType.create(props);
  }

  createHotelRoom(props: {
    roomTypeId: RoomTypeId;
    roomNumber: RoomNumberVO;
    floorId?: string;
    notes?: string;
  }): HotelRoom {
    return HotelRoom.create(props);
  }
}
