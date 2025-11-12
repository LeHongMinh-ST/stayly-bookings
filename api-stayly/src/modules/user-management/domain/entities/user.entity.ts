/**
 * User aggregate encapsulates administration staff and owner accounts
 */
import { Email } from '../../../../common/domain/value-objects/email.vo';
import { PasswordHash } from '../../../../common/domain/value-objects/password-hash.vo';
import { DomainEvent } from '../../../../common/domain/interfaces/domain-event.interface';
import { UserId } from '../value-objects/user-id.vo';
import { Permission } from '../value-objects/permission.vo';
import { Role, UserRole } from '../value-objects/role.vo';
import { Status, UserStatus } from '../value-objects/user-status.vo';
import { UserCreatedEvent } from '../events/user-created.event';

export interface CreateUserProps {
  id: UserId;
  email: Email;
  fullName: string;
  passwordHash: PasswordHash;
  status?: Status;
  roles?: Role[];
  permissions?: Permission[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  private domainEvents: DomainEvent[] = [];
  private updatedAt: Date;

  private constructor(
    private readonly id: UserId,
    private email: Email,
    private fullName: string,
    private passwordHash: PasswordHash,
    private status: Status,
    private roles: Role[],
    private permissions: Permission[],
    private readonly createdAt: Date,
  ) {
    this.updatedAt = createdAt;
  }

  static create(props: CreateUserProps): User {
    if (!props.fullName?.trim()) {
      throw new Error('User full name is required');
    }

    const now = new Date();
    const user = new User(
      props.id,
      props.email,
      props.fullName.trim(),
      props.passwordHash,
      props.status ?? Status.create(UserStatus.ACTIVE),
      props.roles ?? [Role.create(UserRole.STAFF)],
      props.permissions ?? [],
      props.createdAt ?? now,
    );

    user.recordEvent(new UserCreatedEvent(user.id.getValue(), now));
    return user;
  }

  static rehydrate(props: {
    id: UserId;
    email: Email;
    fullName: string;
    passwordHash: PasswordHash;
    status: Status;
    roles: Role[];
    permissions: Permission[];
    createdAt: Date;
    updatedAt: Date;
  }): User {
    const user = new User(
      props.id,
      props.email,
      props.fullName,
      props.passwordHash,
      props.status,
      props.roles,
      props.permissions,
      props.createdAt,
    );
    user.updatedAt = props.updatedAt;
    return user;
  }

  rename(fullName: string): void {
    if (!fullName?.trim()) {
      throw new Error('User full name is required');
    }
    this.fullName = fullName.trim();
    this.touch();
  }

  assignRoles(nextRoles: Role[]): void {
    if (!nextRoles.length) {
      throw new Error('User must have at least one role');
    }
    this.roles = nextRoles;
    this.touch();
  }

  assignPermissions(nextPermissions: Permission[]): void {
    this.permissions = nextPermissions;
    this.touch();
  }

  updateStatus(nextStatus: Status): void {
    this.status = nextStatus;
    this.touch();
  }

  changePassword(nextPasswordHash: PasswordHash): void {
    this.passwordHash = nextPasswordHash;
    this.touch();
  }

  getId(): UserId {
    return this.id;
  }

  getEmail(): Email {
    return this.email;
  }

  getFullName(): string {
    return this.fullName;
  }

  getPasswordHash(): PasswordHash {
    return this.passwordHash;
  }

  getStatus(): Status {
    return this.status;
  }

  getRoles(): Role[] {
    return [...this.roles];
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
