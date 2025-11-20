/**
 * RoomTypeId Value Object
 * Represents identifier for RoomType aggregate
 */
import { BaseId } from "../../../../common/domain/value-objects/base-id.vo";

export class RoomTypeId extends BaseId {
  static create(value: string): RoomTypeId {
    return new RoomTypeId(value);
  }
}
