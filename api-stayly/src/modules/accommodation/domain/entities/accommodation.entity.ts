/**
 * Accommodation Aggregate Root
 * Manages homestay and hotel information
 * Uses Single Table Inheritance pattern
 */

import { BaseEntity } from "../../../../common/domain/entities/base.entity";
import { AccommodationId } from "../value-objects/accommodation-id.vo";
import {
  AccommodationStatus,
  AccommodationStatusVO,
} from "../value-objects/accommodation-status.vo";
import { Address } from "../value-objects/address.vo";
import { Location } from "../value-objects/location.vo";
import { CancellationPolicy } from "../value-objects/cancellation-policy.vo";
import { Policies } from "../value-objects/policies.vo";
import { AccommodationCreatedEvent } from "../events/accommodation-created.event";
import { AccommodationApprovedEvent } from "../events/accommodation-approved.event";
import {
  InvalidInputError,
  InvalidStateError,
} from "../../../../common/domain/errors";

export enum AccommodationType {
  HOMESTAY = "homestay",
  HOTEL = "hotel",
}

export interface CreateAccommodationProps {
  type: AccommodationType;
  name: string;
  ownerId: string;
  address: Address;
  location: Location;
  description: string;
  images: string[];
  amenities: string[];
  policies: Policies;
  cancellationPolicy: CancellationPolicy;
}

export class Accommodation extends BaseEntity<AccommodationId> {
  private constructor(
    id: AccommodationId,
    private readonly type: AccommodationType,
    private name: string,
    private status: AccommodationStatusVO,
    private readonly ownerId: string,
    private address: Address,
    private location: Location,
    private description: string,
    private images: string[],
    private amenities: string[],
    private policies: Policies,
    private cancellationPolicy: CancellationPolicy,
    private approvedBy: string | null = null,
    private approvedAt: Date | null = null,
  ) {
    super(id);
  }

  static create(props: CreateAccommodationProps): Accommodation {
    // Business rules validation
    if (props.type === AccommodationType.HOMESTAY) {
      if (props.images.length < 3 || props.images.length > 20) {
        throw new InvalidInputError(
          "Homestay must have between 3 and 20 images",
        );
      }
    } else if (props.type === AccommodationType.HOTEL) {
      if (props.images.length < 5 || props.images.length > 50) {
        throw new InvalidInputError("Hotel must have between 5 and 50 images");
      }
    }

    const accommodationId = AccommodationId.create(crypto.randomUUID());
    const accommodation = new Accommodation(
      accommodationId,
      props.type,
      props.name,
      AccommodationStatusVO.create(AccommodationStatus.PENDING),
      props.ownerId,
      props.address,
      props.location,
      props.description,
      props.images,
      props.amenities,
      props.policies,
      props.cancellationPolicy,
    );

    // Raise domain event
    accommodation.recordEvent(
      new AccommodationCreatedEvent(accommodationId, props.ownerId, props.type),
    );

    return accommodation;
  }

  static rehydrate(props: {
    id: AccommodationId;
    type: AccommodationType;
    name: string;
    status: AccommodationStatusVO;
    ownerId: string;
    address: Address;
    location: Location;
    description: string;
    images: string[];
    amenities: string[];
    policies: Policies;
    cancellationPolicy: CancellationPolicy;
    approvedBy: string | null;
    approvedAt: Date | null;
  }): Accommodation {
    return new Accommodation(
      props.id,
      props.type,
      props.name,
      props.status,
      props.ownerId,
      props.address,
      props.location,
      props.description,
      props.images,
      props.amenities,
      props.policies,
      props.cancellationPolicy,
      props.approvedBy,
      props.approvedAt,
    );
  }

  // Getters
  // getId() is inherited from BaseEntity

  getType(): AccommodationType {
    return this.type;
  }

  getName(): string {
    return this.name;
  }

  getStatus(): AccommodationStatusVO {
    return this.status;
  }

  getOwnerId(): string {
    return this.ownerId;
  }

  getAddress(): Address {
    return this.address;
  }

  getLocation(): Location {
    return this.location;
  }

  getDescription(): string {
    return this.description;
  }

  getImages(): string[] {
    return this.images;
  }

  getAmenities(): string[] {
    return this.amenities;
  }

  getPolicies(): Policies {
    return this.policies;
  }

  getCancellationPolicy(): CancellationPolicy {
    return this.cancellationPolicy;
  }

  getApprovedBy(): string | null {
    return this.approvedBy;
  }

  getApprovedAt(): Date | null {
    return this.approvedAt;
  }

  // Business methods
  approve(approvedBy: string): void {
    if (!this.status.isPending()) {
      throw new InvalidStateError(
        "Only pending accommodations can be approved",
      );
    }

    this.status = AccommodationStatusVO.create(AccommodationStatus.APPROVED);
    this.approvedBy = approvedBy;
    this.approvedAt = new Date();

    // Raise domain event
    this.recordEvent(new AccommodationApprovedEvent(this.getId(), approvedBy));
  }

  reject(approvedBy: string): void {
    if (!this.status.isPending()) {
      throw new Error("Only pending accommodations can be rejected");
    }

    this.status = AccommodationStatusVO.create(AccommodationStatus.REJECTED);
    this.approvedBy = approvedBy;
    this.approvedAt = new Date();
  }

  activate(): void {
    if (!this.status.isApproved()) {
      throw new Error("Only approved accommodations can be activated");
    }

    this.status = AccommodationStatusVO.create(AccommodationStatus.ACTIVE);
  }

  suspend(): void {
    if (!this.status.isActive()) {
      throw new Error("Only active accommodations can be suspended");
    }

    this.status = AccommodationStatusVO.create(AccommodationStatus.SUSPENDED);
  }

  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error("Name cannot be empty");
    }
    this.name = name;
  }

  updateAddress(address: Address): void {
    this.address = address;
  }

  updateDescription(description: string): void {
    this.description = description;
  }

  updateImages(images: string[]): void {
    // Validate image count based on type
    if (this.type === AccommodationType.HOMESTAY) {
      if (images.length < 3 || images.length > 20) {
        throw new Error("Homestay must have between 3 and 20 images");
      }
    } else if (this.type === AccommodationType.HOTEL) {
      if (images.length < 5 || images.length > 50) {
        throw new Error("Hotel must have between 5 and 50 images");
      }
    }
    this.images = images;
  }

  canBeDeleted(): boolean {
    // Business rule: Cannot delete accommodation with bookings in next 30 days
    // This will be checked in domain service
    return this.status.canBeDeleted();
  }
}
