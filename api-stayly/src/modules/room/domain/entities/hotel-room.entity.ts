/**
 * HotelRoom entity represents a physical room under a RoomType
 */
import { BaseEntity } from "../../../../common/domain/entities/base.entity";
import { InvalidInputError } from "../../../../common/domain/errors";
import { HotelRoomId } from "../value-objects/hotel-room-id.vo";
import { RoomTypeId } from "../value-objects/room-type-id.vo";
import { RoomNumberVO } from "../value-objects/room-number.vo";
import {
  HotelRoomStatus,
  HotelRoomStatusVO,
} from "../value-objects/hotel-room-status.vo";

export interface CreateHotelRoomProps {
  roomTypeId: RoomTypeId;
  roomNumber: RoomNumberVO;
  floorId?: string;
  notes?: string;
}

export class HotelRoom extends BaseEntity<HotelRoomId> {
  private constructor(
    id: HotelRoomId,
    private readonly roomTypeId: RoomTypeId,
    private roomNumber: RoomNumberVO,
    private readonly floorId?: string,
    private notes?: string,
    private status: HotelRoomStatusVO = HotelRoomStatusVO.available(),
  ) {
    super(id);
  }

  static create(props: CreateHotelRoomProps): HotelRoom {
    return new HotelRoom(
      HotelRoomId.create(crypto.randomUUID()),
      props.roomTypeId,
      props.roomNumber,
      props.floorId,
      props.notes,
      HotelRoomStatusVO.available(),
    );
  }

  static rehydrate(props: {
    id: HotelRoomId;
    roomTypeId: RoomTypeId;
    roomNumber: RoomNumberVO;
    status: HotelRoomStatusVO;
    floorId?: string;
    notes?: string;
  }): HotelRoom {
    return new HotelRoom(
      props.id,
      props.roomTypeId,
      props.roomNumber,
      props.floorId,
      props.notes,
      props.status,
    );
  }

  getRoomTypeId(): RoomTypeId {
    return this.roomTypeId;
  }

  getFloorId(): string | undefined {
    return this.floorId;
  }

  getRoomNumber(): RoomNumberVO {
    return this.roomNumber;
  }

  getStatus(): HotelRoomStatusVO {
    return this.status;
  }

  getNotes(): string | undefined {
    return this.notes;
  }

  updateRoomNumber(roomNumber: RoomNumberVO): void {
    this.roomNumber = roomNumber;
  }

  setNotes(notes?: string): void {
    this.notes = notes;
  }

  markOccupied(): void {
    this.status = HotelRoomStatusVO.create(HotelRoomStatus.OCCUPIED);
  }

  markClean(): void {
    this.status = HotelRoomStatusVO.create(HotelRoomStatus.CLEAN);
  }

  markDirty(): void {
    this.status = HotelRoomStatusVO.create(HotelRoomStatus.DIRTY);
  }

  markMaintenance(): void {
    this.status = HotelRoomStatusVO.create(HotelRoomStatus.MAINTENANCE);
  }

  release(): void {
    if (
      this.status.value() !== HotelRoomStatus.OCCUPIED &&
      this.status.value() !== HotelRoomStatus.MAINTENANCE
    ) {
      throw new InvalidInputError(
        "Only occupied or maintenance rooms can be released",
      );
    }
    this.status = HotelRoomStatusVO.available();
  }
}
