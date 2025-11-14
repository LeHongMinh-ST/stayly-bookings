/**
 * User aggregate encapsulates administration staff and owner accounts
 */
import { BaseEntity } from '../../../../common/domain/entities/base.entity';
import { InvalidInputError } from '../../../../common/domain/errors';
import { Email } from '../../../../common/domain/value-objects/email.vo';
import { PasswordHash } from '../../../../common/domain/value-objects/password-hash.vo';
import { UserId } from '../value-objects/user-id.vo';
import { Status, UserStatus } from '../value-objects/user-status.vo';
import { UserCreatedEvent } from '../events/user-created.event';

export interface CreateUserProps {
  id: UserId;
  email: Email;
  fullName: string;
  passwordHash: PasswordHash;
  status?: Status;
}

export class User extends BaseEntity<UserId> {
  private constructor(
    id: UserId,
    private email: Email,
    private fullName: string,
    private passwordHash: PasswordHash,
    private status: Status,
  ) {
    super(id);
  }

  static create(props: CreateUserProps): User {
    if (!props.fullName?.trim()) {
      throw new InvalidInputError('User full name is required', 'fullName');
    }

    const now = new Date();
    const user = new User(
      props.id,
      props.email,
      props.fullName.trim(),
      props.passwordHash,
      props.status ?? Status.create(UserStatus.ACTIVE),
    );

    user.recordEvent(new UserCreatedEvent(user.getId().getValue(), now));
    return user;
  }

  static rehydrate(props: {
    id: UserId;
    email: Email;
    fullName: string;
    passwordHash: PasswordHash;
    status: Status;
  }): User {
    return new User(
      props.id,
      props.email,
      props.fullName,
      props.passwordHash,
      props.status,
    );
  }

  rename(fullName: string): void {
    if (!fullName?.trim()) {
      throw new InvalidInputError('User full name is required', 'fullName');
    }
    this.fullName = fullName.trim();
  }

  updateStatus(nextStatus: Status): void {
    this.status = nextStatus;
  }

  changePassword(nextPasswordHash: PasswordHash): void {
    this.passwordHash = nextPasswordHash;
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

  /**
   * Checks if user account is active
   * Encapsulates status check logic to avoid exposing UserStatus enum to other modules
   */
  isActive(): boolean {
    return this.status.getValue() === UserStatus.ACTIVE;
  }
}
