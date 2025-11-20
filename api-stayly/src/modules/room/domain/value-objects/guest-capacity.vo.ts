/**
 * GuestCapacityVO ensures capacity ranges follow business rules
 */
import { InvalidInputError } from "../../../../common/domain/errors";

export interface GuestCapacityProps {
  maxAdults: number;
  maxChildren?: number;
}

export class GuestCapacityVO {
  private constructor(
    private readonly maxAdults: number,
    private readonly maxChildren: number,
  ) {}

  static create(props: GuestCapacityProps): GuestCapacityVO {
    if (!Number.isInteger(props.maxAdults) || props.maxAdults < 1) {
      throw new InvalidInputError("Rooms must allow at least one adult");
    }

    const children = props.maxChildren ?? 0;
    if (!Number.isInteger(children) || children < 0) {
      throw new InvalidInputError("Children capacity must be zero or positive");
    }

    return new GuestCapacityVO(props.maxAdults, children);
  }

  getMaxAdults(): number {
    return this.maxAdults;
  }

  getMaxChildren(): number {
    return this.maxChildren;
  }

  getTotalCapacity(): number {
    return this.maxAdults + this.maxChildren;
  }
}
