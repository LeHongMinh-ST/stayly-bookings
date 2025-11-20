/**
 * BedTypeVO encapsulates supported bed configurations for inventory
 */
import { InvalidInputError } from "../../../../common/domain/errors";

export enum BedType {
  SINGLE = "single",
  DOUBLE = "double",
  QUEEN = "queen",
  KING = "king",
  SOFA_BED = "sofa_bed",
  BUNK = "bunk",
}

export class BedTypeVO {
  private constructor(private readonly type: BedType) {}

  static create(type: BedType): BedTypeVO {
    if (!Object.values(BedType).includes(type)) {
      throw new InvalidInputError("Bed type is not supported");
    }
    return new BedTypeVO(type);
  }

  value(): BedType {
    return this.type;
  }
}
