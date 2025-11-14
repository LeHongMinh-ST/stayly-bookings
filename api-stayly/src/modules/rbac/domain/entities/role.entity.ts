/**
 * Role aggregate root encapsulates role business logic
 */
import { BaseEntity } from "../../../../common/domain/entities/base.entity";
import { InvalidInputError } from "../../../../common/domain/errors";
import { RoleId } from "../value-objects/role-id.vo";
import { Permission } from "../value-objects/permission.vo";

export interface CreateRoleProps {
  id: RoleId;
  displayName: string;
  isSuperAdmin?: boolean;
  permissions?: Permission[];
}

export class Role extends BaseEntity<RoleId> {
  private constructor(
    id: RoleId,
    private displayName: string,
    private readonly isSuperAdmin: boolean,
    private permissions: Permission[],
  ) {
    super(id);
  }

  static create(props: CreateRoleProps): Role {
    if (!props.displayName?.trim()) {
      throw new InvalidInputError(
        "Role display name is required",
        "displayName",
      );
    }

    const role = new Role(
      props.id,
      props.displayName.trim(),
      props.isSuperAdmin ?? false,
      props.permissions ?? [],
    );

    return role;
  }

  static rehydrate(props: {
    id: RoleId;
    displayName: string;
    isSuperAdmin: boolean;
    permissions: Permission[];
  }): Role {
    return new Role(
      props.id,
      props.displayName,
      props.isSuperAdmin,
      props.permissions,
    );
  }

  updateDisplayName(displayName: string): void {
    if (!displayName?.trim()) {
      throw new InvalidInputError(
        "Role display name is required",
        "displayName",
      );
    }
    this.displayName = displayName.trim();
  }

  assignPermissions(permissions: Permission[]): void {
    // Remove duplicates
    const permissionSet = new Set<string>();
    const uniquePermissions: Permission[] = [];

    for (const permission of permissions) {
      const code = permission.getValue();
      if (!permissionSet.has(code)) {
        permissionSet.add(code);
        uniquePermissions.push(permission);
      }
    }

    this.permissions = uniquePermissions;
  }

  removePermissions(permissionCodes: string[]): void {
    const codesToRemove = new Set(
      permissionCodes.map((code) => code.toLowerCase()),
    );
    this.permissions = this.permissions.filter(
      (permission) => !codesToRemove.has(permission.getValue()),
    );
  }

  canDelete(): boolean {
    // Super admin role cannot be deleted
    return !this.isSuperAdmin;
  }

  getId(): RoleId {
    return super.getId();
  }

  getDisplayName(): string {
    return this.displayName;
  }

  getIsSuperAdmin(): boolean {
    return this.isSuperAdmin;
  }

  getPermissions(): Permission[] {
    return [...this.permissions];
  }
}
