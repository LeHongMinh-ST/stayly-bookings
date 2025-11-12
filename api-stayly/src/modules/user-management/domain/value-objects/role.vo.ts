/**
 * Role value object encapsulates RBAC role semantics for staff users
 */
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  OWNER = 'owner',
  MANAGER = 'manager',
  STAFF = 'staff',
}

export class Role {
  private constructor(private readonly value: UserRole) {}

  static from(value: string): Role {
    const normalized = value?.toLowerCase() as UserRole;
    if (!Object.values(UserRole).includes(normalized)) {
      throw new Error(`Unsupported role: ${value}`);
    }
    return new Role(normalized);
  }

  static create(value: UserRole): Role {
    return new Role(value);
  }

  getValue(): UserRole {
    return this.value;
  }
}
