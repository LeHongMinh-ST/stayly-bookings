/**
 * AccommodationStatus Value Object
 * Represents status of accommodation (pending, approved, rejected, active, suspended)
 */

export enum AccommodationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  ACTIVE = "active",
  SUSPENDED = "suspended",
}

export class AccommodationStatusVO {
  private constructor(private readonly value: AccommodationStatus) {}

  static create(status: AccommodationStatus): AccommodationStatusVO {
    return new AccommodationStatusVO(status);
  }

  getValue(): AccommodationStatus {
    return this.value;
  }

  isPending(): boolean {
    return this.value === AccommodationStatus.PENDING;
  }

  isApproved(): boolean {
    return this.value === AccommodationStatus.APPROVED;
  }

  isActive(): boolean {
    return this.value === AccommodationStatus.ACTIVE;
  }

  isSuspended(): boolean {
    return this.value === AccommodationStatus.SUSPENDED;
  }

  canBeDeleted(): boolean {
    return (
      this.value === AccommodationStatus.REJECTED ||
      this.value === AccommodationStatus.SUSPENDED
    );
  }
}
