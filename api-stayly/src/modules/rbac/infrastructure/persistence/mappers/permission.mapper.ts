/**
 * PermissionOrmMapper converts between Permission value object and ORM entity
 */
import { Permission } from '../../../domain/value-objects/permission.vo';
import { PermissionOrmEntity } from '../entities/permission.orm-entity';

export class PermissionOrmMapper {
  /**
   * Converts ORM entity to Permission value object
   */
  static toDomain(entity: PermissionOrmEntity): Permission {
    return Permission.create(entity.code);
  }

  /**
   * Converts Permission value object to ORM entity
   */
  static toOrm(
    permission: Permission,
    existing?: PermissionOrmEntity,
  ): PermissionOrmEntity {
    const entity = existing ?? new PermissionOrmEntity();
    entity.code = permission.getValue();
    return entity;
  }
}
