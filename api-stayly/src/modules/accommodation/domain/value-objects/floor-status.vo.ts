/**
 * FloorStatus Value Object
 * Represents status of floor (active, maintenance, closed)
 */

export enum FloorStatus {
  ACTIVE = "active",
  MAINTENANCE = "maintenance",
  CLOSED = "closed",
}

export class FloorStatusVO {
  private constructor(private readonly value: FloorStatus) {}

  static create(status: FloorStatus): FloorStatusVO {
    return new FloorStatusVO(status);
  }

  getValue(): FloorStatus {
    return this.value;
  }

  isActive(): boolean {
    return this.value === FloorStatus.ACTIVE;
  }

  isBlocked(): boolean {
    return (
      this.value === FloorStatus.MAINTENANCE ||
      this.value === FloorStatus.CLOSED
    );
  }
}
