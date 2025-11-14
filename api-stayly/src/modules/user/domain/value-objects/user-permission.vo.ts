/**
 * UserPermission value object - local to User module
 * Maps to RBAC Permission value object in infrastructure layer
 */
import { InvalidInputError } from "../../../../common/domain/errors";

export class UserPermission {
  private constructor(private readonly value: string) {}

  static create(value: string): UserPermission {
    const normalized = value?.trim().toLowerCase();
    if (!normalized) {
      throw new InvalidInputError("Permission cannot be empty", "permission");
    }
    if (!/^([a-z]+:){1}[a-z:_-]+$/.test(normalized)) {
      throw new InvalidInputError(
        `Permission must follow module:action naming. Received ${value}`,
        "permission",
        value,
      );
    }
    return new UserPermission(normalized);
  }

  getValue(): string {
    return this.value;
  }
}
