/**
 * RoomType aggregate root (Hotel)
 * Manages hotel-level room categories and HotelRoom children
 */
import { BaseEntity } from "../../../../common/domain/entities/base.entity";
import {
  InvalidInputError,
  InvalidOperationError,
} from "../../../../common/domain/errors";
import { RoomTypeId } from "../value-objects/room-type-id.vo";
import { RoomStatusVO } from "../value-objects/room-status.vo";
import { RoomTypeCategoryVO } from "../value-objects/room-type.vo";
import { GuestCapacityVO } from "../value-objects/guest-capacity.vo";
import { BedTypeVO } from "../value-objects/bed-type.vo";
import { RoomImageVO } from "../value-objects/room-image.vo";
import { RoomInventoryVO } from "../value-objects/room-inventory.vo";
import { MoneyVO } from "../value-objects/money.vo";
import { HotelRoom } from "./hotel-room.entity";
import { HotelRoomId } from "../value-objects/hotel-room-id.vo";
import { RoomNumberVO } from "../value-objects/room-number.vo";
import { HotelRoomStatusVO } from "../value-objects/hotel-room-status.vo";

export interface CreateRoomTypeProps {
  hotelId: string;
  name: string;
  category: RoomTypeCategoryVO;
  area: number;
  capacity: GuestCapacityVO;
  bedCount: number;
  bedType: BedTypeVO;
  description: string;
  amenities: string[];
  images: RoomImageVO[];
  inventory: RoomInventoryVO;
  basePrice: MoneyVO;
  viewDirection?: string;
}

export class RoomType extends BaseEntity<RoomTypeId> {
  private readonly rooms: Map<string, HotelRoom> = new Map();

  private constructor(
    id: RoomTypeId,
    private readonly hotelId: string,
    private name: string,
    private readonly category: RoomTypeCategoryVO,
    private readonly area: number,
    private capacity: GuestCapacityVO,
    private readonly bedCount: number,
    private readonly bedType: BedTypeVO,
    private description: string,
    private amenities: string[],
    private images: RoomImageVO[],
    private inventory: RoomInventoryVO,
    private status: RoomStatusVO,
    private basePrice: MoneyVO,
    private viewDirection?: string,
  ) {
    super(id);
  }

  static create(props: CreateRoomTypeProps): RoomType {
    if (props.images.length < 3) {
      throw new InvalidInputError("Room types require at least three images");
    }

    if (props.inventory.value() < 1) {
      throw new InvalidInputError("Room types must define positive inventory");
    }

    const roomType = new RoomType(
      RoomTypeId.create(crypto.randomUUID()),
      props.hotelId,
      props.name,
      props.category,
      props.area,
      props.capacity,
      props.bedCount,
      props.bedType,
      props.description,
      props.amenities,
      props.images,
      props.inventory,
      RoomStatusVO.active(),
      props.basePrice,
      props.viewDirection,
    );

    return roomType;
  }

  static rehydrate(props: {
    id: RoomTypeId;
    hotelId: string;
    name: string;
    category: RoomTypeCategoryVO;
    area: number;
    capacity: GuestCapacityVO;
    bedCount: number;
    bedType: BedTypeVO;
    description: string;
    amenities: string[];
    images: RoomImageVO[];
    inventory: RoomInventoryVO;
    status: RoomStatusVO;
    basePrice: MoneyVO;
    viewDirection?: string;
    rooms?: HotelRoom[];
  }): RoomType {
    const roomType = new RoomType(
      props.id,
      props.hotelId,
      props.name,
      props.category,
      props.area,
      props.capacity,
      props.bedCount,
      props.bedType,
      props.description,
      props.amenities,
      props.images,
      props.inventory,
      props.status,
      props.basePrice,
      props.viewDirection,
    );

    props.rooms?.forEach((room) => roomType.attachRoom(room));
    return roomType;
  }

  attachRoom(room: HotelRoom): void {
    this.rooms.set(room.getId().getValue(), room);
  }

  getHotelId(): string {
    return this.hotelId;
  }

  getName(): string {
    return this.name;
  }

  getInventory(): RoomInventoryVO {
    return this.inventory;
  }

  getCategory(): RoomTypeCategoryVO {
    return this.category;
  }

  getArea(): number {
    return this.area;
  }

  getCapacity(): GuestCapacityVO {
    return this.capacity;
  }

  getBedType(): BedTypeVO {
    return this.bedType;
  }

  getDescription(): string {
    return this.description;
  }

  getAmenities(): string[] {
    return [...this.amenities];
  }

  getImages(): RoomImageVO[] {
    return [...this.images];
  }

  getStatus(): RoomStatusVO {
    return this.status;
  }

  getBasePrice(): MoneyVO {
    return this.basePrice;
  }

  getViewDirection(): string | undefined {
    return this.viewDirection;
  }

  getBedCount(): number {
    return this.bedCount;
  }

  getRooms(): HotelRoom[] {
    return Array.from(this.rooms.values());
  }

  updateDescription(description: string): void {
    if (!description.trim()) {
      throw new InvalidInputError("Description cannot be empty");
    }
    this.description = description.trim();
  }

  updateAmenities(amenities: string[]): void {
    if (!amenities.length) {
      throw new InvalidInputError("Room type requires at least one amenity");
    }
    this.amenities = [...new Set(amenities.map((item) => item.trim()))];
  }

  updateImages(images: RoomImageVO[]): void {
    if (!images.length) {
      throw new InvalidInputError("Room type requires at least one image");
    }
    this.images = images;
  }

  adjustInventory(next: RoomInventoryVO): void {
    this.inventory = next;
  }

  updateBasePrice(price: MoneyVO): void {
    this.basePrice = price;
  }

  createHotelRoom(props: {
    roomNumber: RoomNumberVO;
    floorId?: string;
    notes?: string;
  }): HotelRoom {
    if (this.rooms.size >= this.inventory.value()) {
      throw new InvalidOperationError(
        "Cannot create more rooms than declared inventory",
      );
    }

    const room = HotelRoom.create({
      roomTypeId: this.getId(),
      roomNumber: props.roomNumber,
      floorId: props.floorId,
      notes: props.notes,
    });

    this.attachRoom(room);
    return room;
  }

  rehydrateHotelRoom(props: {
    id: HotelRoomId;
    roomNumber: RoomNumberVO;
    status: HotelRoomStatusVO;
    roomTypeId: RoomTypeId;
    floorId?: string;
    notes?: string;
  }): HotelRoom {
    const room = HotelRoom.rehydrate(props);
    this.attachRoom(room);
    return room;
  }
}
