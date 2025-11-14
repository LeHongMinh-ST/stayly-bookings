/**
 * UserStatus value object constrains allowed lifecycle states
 */
import { InvalidInputError } from "../../../../common/domain/errors";

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}

export class Status {
  private constructor(private readonly value: UserStatus) {}

  static from(value: string): Status {
    const normalized = value?.toLowerCase() as UserStatus;
    if (!Object.values(UserStatus).includes(normalized)) {
      throw new InvalidInputError(
        `Unsupported user status: ${value}`,
        "status",
        value,
      );
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
