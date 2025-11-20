/**
 * HotelRoomStatusVO describes operational state of a physical hotel room
 */
import { InvalidInputError } from "../../../../common/domain/errors";

export enum HotelRoomStatus {
  AVAILABLE = "available",
  OCCUPIED = "occupied",
  DIRTY = "dirty",
  CLEAN = "clean",
  MAINTENANCE = "maintenance",
  OUT_OF_ORDER = "out_of_order",
}

export class HotelRoomStatusVO {
  private constructor(private readonly status: HotelRoomStatus) {}

  static create(status: HotelRoomStatus): HotelRoomStatusVO {
    if (!Object.values(HotelRoomStatus).includes(status)) {
      throw new InvalidInputError("Hotel room status is not supported");
    }
    return new HotelRoomStatusVO(status);
  }

  static available(): HotelRoomStatusVO {
    return new HotelRoomStatusVO(HotelRoomStatus.AVAILABLE);
  }

  value(): HotelRoomStatus {
    return this.status;
  }

  isInService(): boolean {
    return (
      this.status === HotelRoomStatus.AVAILABLE ||
      this.status === HotelRoomStatus.CLEAN
    );
  }

  isBlocked(): boolean {
    return (
      this.status === HotelRoomStatus.MAINTENANCE ||
      this.status === HotelRoomStatus.OUT_OF_ORDER
    );
  }
}
