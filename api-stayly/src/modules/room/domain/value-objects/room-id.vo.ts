/**
 * RoomId Value Object
 * Represents identifier for Room aggregate
 */
import { BaseId } from "../../../../common/domain/value-objects/base-id.vo";

export class RoomId extends BaseId {
  static create(value: string): RoomId {
    return new RoomId(value);
  }
}
