/**
 * UserOrmMapper converts between domain user aggregate and ORM entity
 */
import { Email } from '../../../../../common/domain/value-objects/email.vo';
import { PasswordHash } from '../../../../../common/domain/value-objects/password-hash.vo';
import { User } from '../../../domain/entities/user.entity';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { Role } from '../../../domain/value-objects/role.vo';
import { Permission } from '../../../domain/value-objects/permission.vo';
import { Status, UserStatus } from '../../../domain/value-objects/user-status.vo';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { RoleOrmEntity } from '../entities/role.orm-entity';
import { PermissionOrmEntity } from '../entities/permission.orm-entity';

export class UserOrmMapper {
  /**
   * Converts ORM entity to domain aggregate
   */
  static toDomain(entity: UserOrmEntity): User {
    return User.rehydrate({
      id: UserId.create(entity.id),
      email: Email.create(entity.email),
      fullName: entity.fullName,
      passwordHash: PasswordHash.create(entity.passwordHash),
      status: Status.from(entity.status),
      roles: (entity.roles || []).map((role) => Role.from(role.code)),
      permissions: (entity.permissions || []).map((permission) =>
        Permission.create(permission.code),
      ),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  /**
   * Applies domain state to ORM entity instance
   */
  static toOrm(
    aggregate: User,
    roleEntities: RoleOrmEntity[],
    permissionEntities: PermissionOrmEntity[],
    existing?: UserOrmEntity,
  ): UserOrmEntity {
    const entity = existing ?? new UserOrmEntity();
    entity.id = aggregate.getId().getValue();
    entity.email = aggregate.getEmail().getValue();
    entity.fullName = aggregate.getFullName();
    entity.passwordHash = aggregate.getPasswordHash().getValue();
    entity.status = aggregate.getStatus().getValue();
    entity.roles = roleEntities;
    entity.permissions = permissionEntities;
    return entity;
  }
}
