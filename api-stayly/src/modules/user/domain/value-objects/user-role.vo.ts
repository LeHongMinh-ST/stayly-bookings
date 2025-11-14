/**
 * UserRole value object - local to User module
 * Maps to RBAC Role value object in infrastructure layer
 */
import { InvalidInputError } from '../../../../common/domain/errors';

export enum UserRoleEnum {
  SUPER_ADMIN = 'super_admin',
  OWNER = 'owner',
  MANAGER = 'manager',
  STAFF = 'staff',
}

export class UserRole {
  private constructor(private readonly value: UserRoleEnum) {}

  static from(value: string): UserRole {
    const normalized = value?.toLowerCase() as UserRoleEnum;
    if (!Object.values(UserRoleEnum).includes(normalized)) {
      throw new InvalidInputError(`Unsupported role: ${value}`, 'role', value);
    }
    return new UserRole(normalized);
  }

  static create(value: UserRoleEnum): UserRole {
    return new UserRole(value);
  }

  getValue(): UserRoleEnum {
    return this.value;
  }

  getValueAsString(): string {
    return this.value;
  }
}

