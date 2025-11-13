/**
 * Permission value object records fine-grained RBAC permissions
 */
export class Permission {
  private constructor(private readonly value: string) {}

  static create(value: string): Permission {
    const normalized = value?.trim().toLowerCase();
    if (!normalized) {
      throw new Error('Permission cannot be empty');
    }
    if (!/^([a-z]+:){1}[a-z:_-]+$/.test(normalized)) {
      throw new Error(
        `Permission must follow module:action naming. Received ${value}`,
      );
    }
    return new Permission(normalized);
  }

  getValue(): string {
    return this.value;
  }
}
