/**
 * UserStatus value object constrains allowed lifecycle states
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export class Status {
  private constructor(private readonly value: UserStatus) {}

  static from(value: string): Status {
    const normalized = value?.toLowerCase() as UserStatus;
    if (!Object.values(UserStatus).includes(normalized)) {
      throw new Error(`Unsupported user status: ${value}`);
    }
    return new Status(normalized);
  }

  static create(value: UserStatus): Status {
    return new Status(value);
  }

  getValue(): UserStatus {
    return this.value;
  }
}
