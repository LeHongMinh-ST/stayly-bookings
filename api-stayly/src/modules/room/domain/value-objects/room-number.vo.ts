/**
 * RoomNumberVO encapsulates hotel room numbering, validates formatting
 */
import { InvalidInputError } from "../../../../common/domain/errors";

export class RoomNumberVO {
  private constructor(private readonly value: string) {}

  static create(value: string): RoomNumberVO {
    if (!value?.trim()) {
      throw new InvalidInputError("Room number cannot be empty");
    }

    if (value.length > 32) {
      throw new InvalidInputError("Room number is too long");
    }

    return new RoomNumberVO(value.trim());
  }

  getValue(): string {
    return this.value;
  }
}
