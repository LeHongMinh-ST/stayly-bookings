/**
 * AccommodationStatus Value Object
 * Represents status of accommodation (pending, approved, rejected, active, suspended)
 */

export enum AccommodationStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  INACTIVE = "inactive",
}

export class AccommodationStatusVO {
  private constructor(private readonly value: AccommodationStatus) {}

  static create(status: AccommodationStatus): AccommodationStatusVO {
    return new AccommodationStatusVO(status);
  }

  getValue(): AccommodationStatus {
    return this.value;
  }

  isActive(): boolean {
    return this.value === AccommodationStatus.ACTIVE;
  }

  isSuspended(): boolean {
    return this.value === AccommodationStatus.SUSPENDED;
  }

  canBeDeleted(): boolean {
    return (
      this.value === AccommodationStatus.INACTIVE ||
      this.value === AccommodationStatus.SUSPENDED
    );
  }
}
