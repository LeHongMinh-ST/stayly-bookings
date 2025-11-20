/**
 * RoomStatusVO encapsulates lifecycle of homestay rooms and hotel room types
 */
import { InvalidInputError } from "../../../../common/domain/errors";

export enum RoomStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export class RoomStatusVO {
  private constructor(private readonly status: RoomStatus) {}

  static create(status: RoomStatus): RoomStatusVO {
    if (!Object.values(RoomStatus).includes(status)) {
      throw new InvalidInputError("Room status is not supported");
    }
    return new RoomStatusVO(status);
  }

  static active(): RoomStatusVO {
    return new RoomStatusVO(RoomStatus.ACTIVE);
  }

  static inactive(): RoomStatusVO {
    return new RoomStatusVO(RoomStatus.INACTIVE);
  }

  value(): RoomStatus {
    return this.status;
  }

  isActive(): boolean {
    return this.status === RoomStatus.ACTIVE;
  }

  isInactive(): boolean {
    return this.status === RoomStatus.INACTIVE;
  }
}
