/**
 * Role aggregate root encapsulates role business logic
 */
import { DomainEvent } from '../../../../common/domain/interfaces/domain-event.interface';
import { RoleId } from '../value-objects/role-id.vo';
import { Permission } from '../value-objects/permission.vo';

export interface CreateRoleProps {
  id: RoleId;
  code: string;
  displayName: string;
  isSuperAdmin?: boolean;
  permissions?: Permission[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Role {
  private domainEvents: DomainEvent[] = [];
  private updatedAt: Date;

  private constructor(
    private readonly id: RoleId,
    private code: string,
    private displayName: string,
    private readonly isSuperAdmin: boolean,
    private permissions: Permission[],
    private readonly createdAt: Date,
  ) {
    this.updatedAt = createdAt;
  }

  static create(props: CreateRoleProps): Role {
    if (!props.code?.trim()) {
      throw new Error('Role code is required');
    }
    if (!props.displayName?.trim()) {
      throw new Error('Role display name is required');
    }

    // Validate code format (lowercase, alphanumeric and underscore)
    const codeRegex = /^[a-z0-9_]+$/;
    const normalizedCode = props.code.trim().toLowerCase();
    if (!codeRegex.test(normalizedCode)) {
      throw new Error(
        'Role code must contain only lowercase letters, numbers, and underscores',
      );
    }

    const now = new Date();
    const role = new Role(
      props.id,
      normalizedCode,
      props.displayName.trim(),
      props.isSuperAdmin ?? false,
      props.permissions ?? [],
      props.createdAt ?? now,
    );

    return role;
  }

  static rehydrate(props: {
    id: RoleId;
    code: string;
    displayName: string;
    isSuperAdmin: boolean;
    permissions: Permission[];
    createdAt: Date;
    updatedAt: Date;
  }): Role {
    const role = new Role(
      props.id,
      props.code,
      props.displayName,
      props.isSuperAdmin,
      props.permissions,
      props.createdAt,
    );
    role.updatedAt = props.updatedAt;
    return role;
  }

  updateDisplayName(displayName: string): void {
    if (!displayName?.trim()) {
      throw new Error('Role display name is required');
    }
    this.displayName = displayName.trim();
    this.touch();
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
    this.touch();
  }

  removePermissions(permissionCodes: string[]): void {
    const codesToRemove = new Set(permissionCodes.map((code) => code.toLowerCase()));
    this.permissions = this.permissions.filter(
      (permission) => !codesToRemove.has(permission.getValue()),
    );
    this.touch();
  }

  canDelete(): boolean {
    // Super admin role cannot be deleted
    return !this.isSuperAdmin;
  }

  getId(): RoleId {
    return this.id;
  }

  getCode(): string {
    return this.code;
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

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents = [];
    return events;
  }

  private recordEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  private touch(): void {
    this.updatedAt = new Date();
  }
}

