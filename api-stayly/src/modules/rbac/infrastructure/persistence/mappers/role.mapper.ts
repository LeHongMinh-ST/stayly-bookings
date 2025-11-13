/**
 * RoleOrmMapper converts between domain role aggregate and ORM entity
 */
import { Role } from '../../../domain/entities/role.entity';
import { RoleId } from '../../../domain/value-objects/role-id.vo';
import { Permission } from '../../../domain/value-objects/permission.vo';
import { RoleOrmEntity } from '../entities/role.orm-entity';
import { PermissionOrmEntity } from '../entities/permission.orm-entity';

export class RoleOrmMapper {
  /**
   * Converts ORM entity to domain aggregate
   */
  static toDomain(entity: RoleOrmEntity): Role {
    const permissions = (entity.permissions || []).map((permission) =>
      Permission.create(permission.code),
    );

    return Role.rehydrate({
      id: RoleId.create(entity.id),
      code: entity.code,
      displayName: entity.displayName,
      isSuperAdmin: entity.isSuperAdmin,
      permissions,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  /**
   * Applies domain state to ORM entity instance
   */
  static toOrm(
    aggregate: Role,
    permissionEntities: PermissionOrmEntity[],
    existing?: RoleOrmEntity,
  ): RoleOrmEntity {
    const entity = existing ?? new RoleOrmEntity();
    entity.id = aggregate.getId().getValue();
    entity.code = aggregate.getCode();
    entity.displayName = aggregate.getDisplayName();
    entity.isSuperAdmin = aggregate.getIsSuperAdmin();
    entity.permissions = permissionEntities;
    return entity;
  }
}
