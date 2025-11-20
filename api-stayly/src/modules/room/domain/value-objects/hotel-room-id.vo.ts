/**
 * HotelRoomId Value Object
 * Identifies physical rooms under a RoomType
 */
import { BaseId } from "../../../../common/domain/value-objects/base-id.vo";

export class HotelRoomId extends BaseId {
  static create(value: string): HotelRoomId {
    return new HotelRoomId(value);
  }
}
