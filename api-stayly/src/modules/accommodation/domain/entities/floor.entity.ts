/**
 * Floor Entity
 * Represents a floor in a hotel (only for Hotel type)
 * Part of Accommodation Aggregate
 */

import { FloorStatus, FloorStatusVO } from "../value-objects/floor-status.vo";
import { FloorType, FloorTypeVO } from "../value-objects/floor-type.vo";
import { AccommodationId } from "../value-objects/accommodation-id.vo";
import { InvalidInputError } from "../../../../common/domain/errors";

export interface CreateFloorProps {
  hotelId: AccommodationId;
  floorNumber: number;
  name: string;
  floorType: FloorType;
  description?: string;
  amenities?: string[];
}

export class Floor {
  private constructor(
    private readonly id: string,
    private readonly hotelId: AccommodationId,
    private floorNumber: number,
    private name: string,
    private floorType: FloorTypeVO,
    private status: FloorStatusVO,
    private description: string | null,
    private amenities: string[],
  ) {}

  static create(props: CreateFloorProps): Floor {
    if (props.floorNumber < 0) {
      throw new InvalidInputError("Floor number must be non-negative");
    }

    return new Floor(
      crypto.randomUUID(),
      props.hotelId,
      props.floorNumber,
      props.name,
      FloorTypeVO.create(props.floorType),
      FloorStatusVO.create(FloorStatus.ACTIVE),
      props.description || null,
      props.amenities || [],
    );
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getHotelId(): AccommodationId {
    return this.hotelId;
  }

  getFloorNumber(): number {
    return this.floorNumber;
  }

  getName(): string {
    return this.name;
  }

  getFloorType(): FloorTypeVO {
    return this.floorType;
  }

  getStatus(): FloorStatusVO {
    return this.status;
  }

  getDescription(): string | null {
    return this.description;
  }

  getAmenities(): string[] {
    return this.amenities;
  }

  // Business methods
  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new InvalidInputError("Name cannot be empty");
    }
    this.name = name;
  }

  updateDescription(description: string): void {
    this.description = description;
  }

  updateAmenities(amenities: string[]): void {
    this.amenities = amenities;
  }

  blockForMaintenance(): void {
    this.status = FloorStatusVO.create(FloorStatus.MAINTENANCE);
  }

  close(): void {
    this.status = FloorStatusVO.create(FloorStatus.CLOSED);
  }

  activate(): void {
    this.status = FloorStatusVO.create(FloorStatus.ACTIVE);
  }

  isBlocked(): boolean {
    return this.status.isBlocked();
  }
}
