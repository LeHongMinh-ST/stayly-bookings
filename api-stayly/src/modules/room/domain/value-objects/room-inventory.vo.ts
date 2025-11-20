/**
 * RoomInventoryVO keeps track of available rooms for homestay/room types
 */
import { InvalidInputError } from "../../../../common/domain/errors";

export class RoomInventoryVO {
  private constructor(private readonly totalUnits: number) {}

  static create(totalUnits: number): RoomInventoryVO {
    if (!Number.isInteger(totalUnits) || totalUnits < 1) {
      throw new InvalidInputError(
        "Inventory must be an integer greater than zero",
      );
    }
    return new RoomInventoryVO(totalUnits);
  }

  value(): number {
    return this.totalUnits;
  }

  increase(by = 1): RoomInventoryVO {
    return RoomInventoryVO.create(this.totalUnits + by);
  }

  decrease(by = 1): RoomInventoryVO {
    const next = this.totalUnits - by;
    if (next < 1) {
      throw new InvalidInputError("Inventory cannot go below 1 unit");
    }
    return RoomInventoryVO.create(next);
  }
}
