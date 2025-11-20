/**
 * RoomTypeCategory enumerates supported room categories for homestay & hotel
 */
import { InvalidInputError } from "../../../../common/domain/errors";

export enum RoomTypeCategory {
  SINGLE = "single",
  DOUBLE = "double",
  TWIN = "twin",
  FAMILY = "family",
  SUITE = "suite",
  PENTHOUSE = "penthouse",
  DORMITORY = "dormitory",
  VILLA = "villa",
}

export class RoomTypeCategoryVO {
  private constructor(private readonly category: RoomTypeCategory) {}

  static create(category: RoomTypeCategory): RoomTypeCategoryVO {
    if (!Object.values(RoomTypeCategory).includes(category)) {
      throw new InvalidInputError("Room type category is not supported");
    }
    return new RoomTypeCategoryVO(category);
  }

  value(): RoomTypeCategory {
    return this.category;
  }
}
