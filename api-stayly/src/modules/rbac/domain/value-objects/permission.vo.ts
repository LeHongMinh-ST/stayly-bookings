/**
 * Permission value object records fine-grained RBAC permissions
 */
import { InvalidInputError } from "../../../../common/domain/errors";

export class Permission {
  private constructor(private readonly value: string) {}

  static create(value: string): Permission {
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
    return new Permission(normalized);
  }

  getValue(): string {
    return this.value;
  }
}
