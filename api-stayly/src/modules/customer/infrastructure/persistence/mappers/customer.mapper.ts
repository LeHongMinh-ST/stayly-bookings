/**
 * CustomerOrmMapper converts between ORM entity and customer aggregate
 */
import { Email } from '../../../../../common/domain/value-objects/email.vo';
import { PasswordHash } from '../../../../../common/domain/value-objects/password-hash.vo';
import { Customer } from '../../../domain/entities/customer.entity';
import { CustomerId } from '../../../domain/value-objects/customer-id.vo';
import { Status } from '../../../domain/value-objects/customer-status.vo';
import { CustomerOrmEntity } from '../entities/customer.orm-entity';

export class CustomerOrmMapper {
  static toDomain(entity: CustomerOrmEntity): Customer {
    return Customer.rehydrate({
      id: CustomerId.create(entity.id),
      email: Email.create(entity.email),
      fullName: entity.fullName,
      passwordHash: PasswordHash.create(entity.passwordHash),
      phone: entity.phone,
      dateOfBirth: entity.dateOfBirth,
      status: Status.from(entity.status),
      emailVerifiedAt: entity.emailVerifiedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toOrm(
    aggregate: Customer,
    existing?: CustomerOrmEntity,
  ): CustomerOrmEntity {
    const entity = existing ?? new CustomerOrmEntity();
    entity.id = aggregate.getId().getValue();
    entity.email = aggregate.getEmail().getValue();
    entity.fullName = aggregate.getFullName();
    entity.passwordHash = aggregate.getPasswordHash().getValue();
    entity.phone = aggregate.getPhone();
    entity.dateOfBirth = aggregate.getDateOfBirth();
    entity.status = aggregate.getStatus().getValue();
    entity.emailVerifiedAt = aggregate.getEmailVerifiedAt();
    return entity;
  }
}
