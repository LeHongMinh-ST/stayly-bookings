/**
 * Customer aggregate encapsulates guest registration and profile state
 */
import { Email } from '../../../../common/domain/value-objects/email.vo';
import { PasswordHash } from '../../../../common/domain/value-objects/password-hash.vo';
import { DomainEvent } from '../../../../common/domain/interfaces/domain-event.interface';
import { CustomerId } from '../value-objects/customer-id.vo';
import { Status, CustomerStatus } from '../value-objects/customer-status.vo';
import { CustomerRegisteredEvent } from '../events/customer-registered.event';

export interface CreateCustomerProps {
  id: CustomerId;
  email: Email;
  passwordHash: PasswordHash;
  fullName: string;
  phone?: string | null;
  dateOfBirth?: Date | null;
  status?: Status;
  emailVerifiedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Customer {
  private domainEvents: DomainEvent[] = [];
  private updatedAt: Date;

  private constructor(
    private readonly id: CustomerId,
    private email: Email,
    private passwordHash: PasswordHash,
    private fullName: string,
    private phone: string | null,
    private dateOfBirth: Date | null,
    private status: Status,
    private emailVerifiedAt: Date | null,
    private readonly createdAt: Date,
  ) {
    this.updatedAt = createdAt;
  }

  static register(props: CreateCustomerProps): Customer {
    if (!props.fullName?.trim()) {
      throw new Error('Customer full name is required');
    }

    const now = new Date();
    const customer = new Customer(
      props.id,
      props.email,
      props.passwordHash,
      props.fullName.trim(),
      props.phone ?? null,
      props.dateOfBirth ?? null,
      props.status ?? Status.create(CustomerStatus.ACTIVE),
      props.emailVerifiedAt ?? null,
      props.createdAt ?? now,
    );

    customer.recordEvent(
      new CustomerRegisteredEvent(customer.id.getValue(), customer.email.getValue(), now),
    );
    return customer;
  }

  static rehydrate(props: {
    id: CustomerId;
    email: Email;
    passwordHash: PasswordHash;
    fullName: string;
    phone: string | null;
    dateOfBirth: Date | null;
    status: Status;
    emailVerifiedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): Customer {
    const customer = new Customer(
      props.id,
      props.email,
      props.passwordHash,
      props.fullName,
      props.phone,
      props.dateOfBirth,
      props.status,
      props.emailVerifiedAt,
      props.createdAt,
    );
    customer.updatedAt = props.updatedAt;
    return customer;
  }

  rename(nextFullName: string): void {
    if (!nextFullName?.trim()) {
      throw new Error('Customer full name is required');
    }
    this.fullName = nextFullName.trim();
    this.touch();
  }

  updateContact(phone: string | null): void {
    this.phone = phone ? phone.trim() : null;
    this.touch();
  }

  verifyEmail(at: Date): void {
    this.emailVerifiedAt = at;
    this.touch();
  }

  changePassword(nextHash: PasswordHash): void {
    this.passwordHash = nextHash;
    this.touch();
  }

  updateStatus(nextStatus: Status): void {
    this.status = nextStatus;
    this.touch();
  }

  getId(): CustomerId {
    return this.id;
  }

  getEmail(): Email {
    return this.email;
  }

  getFullName(): string {
    return this.fullName;
  }

  getPhone(): string | null {
    return this.phone;
  }

  getDateOfBirth(): Date | null {
    return this.dateOfBirth;
  }

  getStatus(): Status {
    return this.status;
  }

  getEmailVerifiedAt(): Date | null {
    return this.emailVerifiedAt;
  }

  getPasswordHash(): PasswordHash {
    return this.passwordHash;
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
