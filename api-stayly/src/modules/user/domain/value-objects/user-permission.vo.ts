/**
 * UserPermission value object - local to User module
 * Maps to RBAC Permission value object in infrastructure layer
 */
export class UserPermission {
  private constructor(private readonly value: string) {}

  static create(value: string): UserPermission {
    const normalized = value?.trim().toLowerCase();
    if (!normalized) {
      throw new Error('Permission cannot be empty');
    }
    if (!/^([a-z]+:){1}[a-z:_-]+$/.test(normalized)) {
      throw new Error(`Permission must follow module:action naming. Received ${value}`);
    }
    return new UserPermission(normalized);
  }

  getValue(): string {
    return this.value;
  }
}

