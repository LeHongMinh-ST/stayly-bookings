/**
 * Room aggregate root (Homestay)
 * Encapsulates room-level business rules for standalone homestay units
 */
import { BaseEntity } from "../../../../common/domain/entities/base.entity";
import {
  InvalidInputError,
  InvalidStateError,
} from "../../../../common/domain/errors";
import { RoomId } from "../value-objects/room-id.vo";
import { RoomStatus, RoomStatusVO } from "../value-objects/room-status.vo";
import { RoomTypeCategoryVO } from "../value-objects/room-type.vo";
import { BedTypeVO } from "../value-objects/bed-type.vo";
import { GuestCapacityVO } from "../value-objects/guest-capacity.vo";
import { RoomInventoryVO } from "../value-objects/room-inventory.vo";
import { RoomImageVO } from "../value-objects/room-image.vo";
import { MoneyVO } from "../value-objects/money.vo";

export interface CreateRoomProps {
  accommodationId: string;
  name: string;
  category: RoomTypeCategoryVO;
  area: number;
  guestCapacity: GuestCapacityVO;
  bedCount: number;
  bedType: BedTypeVO;
  description: string;
  amenities: string[];
  images: RoomImageVO[];
  inventory: RoomInventoryVO;
  basePrice?: MoneyVO;
}

export class Room extends BaseEntity<RoomId> {
  private constructor(
    id: RoomId,
    private readonly accommodationId: string,
    private name: string,
    private readonly category: RoomTypeCategoryVO,
    private readonly area: number,
    private guestCapacity: GuestCapacityVO,
    private readonly bedCount: number,
    private readonly bedType: BedTypeVO,
    private description: string,
    private amenities: string[],
    private images: RoomImageVO[],
    private inventory: RoomInventoryVO,
    private status: RoomStatusVO,
    private basePrice?: MoneyVO,
  ) {
    super(id);
  }

  static create(props: CreateRoomProps): Room {
    if (!props.images.length || props.images.length < 2) {
      throw new InvalidInputError("Homestay rooms require at least two images");
    }

    if (props.images.length > 10) {
      throw new InvalidInputError("Homestay rooms cannot exceed ten images");
    }

    if (props.area <= 0) {
      throw new InvalidInputError("Room area must be positive");
    }

    if (props.bedCount < 1) {
      throw new InvalidInputError("Room must have at least one bed");
    }

    const room = new Room(
      RoomId.create(crypto.randomUUID()),
      props.accommodationId,
      props.name,
      props.category,
      props.area,
      props.guestCapacity,
      props.bedCount,
      props.bedType,
      props.description,
      props.amenities,
      props.images,
      props.inventory,
      RoomStatusVO.active(),
      props.basePrice,
    );

    return room;
  }

  static rehydrate(props: {
    id: RoomId;
    accommodationId: string;
    name: string;
    category: RoomTypeCategoryVO;
    area: number;
    guestCapacity: GuestCapacityVO;
    bedCount: number;
    bedType: BedTypeVO;
    description: string;
    amenities: string[];
    images: RoomImageVO[];
    inventory: RoomInventoryVO;
    status: RoomStatusVO;
    basePrice?: MoneyVO;
  }): Room {
    return new Room(
      props.id,
      props.accommodationId,
      props.name,
      props.category,
      props.area,
      props.guestCapacity,
      props.bedCount,
      props.bedType,
      props.description,
      props.amenities,
      props.images,
      props.inventory,
      props.status,
      props.basePrice,
    );
  }

  getAccommodationId(): string {
    return this.accommodationId;
  }

  getName(): string {
    return this.name;
  }

  getCategory(): RoomTypeCategoryVO {
    return this.category;
  }

  getArea(): number {
    return this.area;
  }

  getGuestCapacity(): GuestCapacityVO {
    return this.guestCapacity;
  }

  getBedCount(): number {
    return this.bedCount;
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

  getInventory(): RoomInventoryVO {
    return this.inventory;
  }

  getStatus(): RoomStatusVO {
    return this.status;
  }

  getBasePrice(): MoneyVO | undefined {
    return this.basePrice;
  }

  updateDescription(description: string): void {
    if (!description.trim()) {
      throw new InvalidInputError("Description cannot be empty");
    }
    this.description = description.trim();
  }

  updateAmenities(amenities: string[]): void {
    if (!amenities.length) {
      throw new InvalidInputError("Rooms require at least one amenity");
    }
    this.amenities = [...new Set(amenities.map((item) => item.trim()))];
  }

  updateImages(images: RoomImageVO[]): void {
    if (!images.length) {
      throw new InvalidInputError("Rooms require at least one image");
    }
    this.images = images;
  }

  activate(): void {
    if (this.status.isActive()) {
      return;
    }
    this.status = RoomStatusVO.create(RoomStatus.ACTIVE);
  }

  deactivate(): void {
    if (this.status.isInactive()) {
      return;
    }

    if (this.inventory.value() > 1) {
      throw new InvalidStateError(
        "Cannot deactivate room that manages multiple inventory units",
      );
    }

    this.status = RoomStatusVO.create(RoomStatus.INACTIVE);
  }
}
