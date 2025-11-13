/**
 * UserOrmMapper converts between domain user aggregate and ORM entity
 */
import { Email } from '../../../../../common/domain/value-objects/email.vo';
import { PasswordHash } from '../../../../../common/domain/value-objects/password-hash.vo';
import { User } from '../../../domain/entities/user.entity';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { UserRole } from '../../../domain/value-objects/user-role.vo';
import { UserPermission } from '../../../domain/value-objects/user-permission.vo';
import { Status } from '../../../domain/value-objects/user-status.vo';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { RoleOrmEntity } from '../../../../rbac/infrastructure/persistence/entities/role.orm-entity';
import { PermissionOrmEntity } from '../../../../rbac/infrastructure/persistence/entities/permission.orm-entity';

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
      roles: (entity.roles || []).map((role) => UserRole.from(role.code)),
      permissions: (entity.permissions || []).map((permission) =>
        UserPermission.create(permission.code),
      ),
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
