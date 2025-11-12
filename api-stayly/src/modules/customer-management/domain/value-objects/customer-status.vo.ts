/**
 * CustomerStatus value object expresses lifecycle state for guests
 */
export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export class Status {
  private constructor(private readonly value: CustomerStatus) {}

  static from(value: string): Status {
    const normalized = value?.toLowerCase() as CustomerStatus;
    if (!Object.values(CustomerStatus).includes(normalized)) {
      throw new Error(`Unsupported customer status: ${value}`);
    }
    return new Status(normalized);
  }

  static create(value: CustomerStatus): Status {
    return new Status(value);
  }

  getValue(): CustomerStatus {
    return this.value;
  }
}
