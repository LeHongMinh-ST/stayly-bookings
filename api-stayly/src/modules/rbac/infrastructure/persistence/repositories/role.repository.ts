/**
 * RoleRepository provides persistence capabilities for role aggregate
 */
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { IRoleRepository } from "../../../domain/repositories/role.repository.interface";
import { Role } from "../../../domain/entities/role.entity";
import { RoleId } from "../../../domain/value-objects/role-id.vo";
import { RoleOrmEntity } from "../entities/role.orm-entity";
import { PermissionOrmEntity } from "../entities/permission.orm-entity";
import { RoleOrmMapper } from "../mappers/role.mapper";
import {
  throwConflict,
  throwInvalidOperation,
} from "../../../../../common/application/exceptions";

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(
    @InjectRepository(RoleOrmEntity)
    private readonly roleRepo: Repository<RoleOrmEntity>,
    @InjectRepository(PermissionOrmEntity)
    private readonly permissionRepo: Repository<PermissionOrmEntity>,
  ) {}

  async findAll(limit?: number, offset?: number): Promise<Role[]> {
    const queryBuilder = this.roleRepo
      .createQueryBuilder("role")
      .leftJoinAndSelect("role.permissions", "permissions")
      .orderBy("role.displayName", "ASC");

    if (limit !== undefined) {
      queryBuilder.take(limit);
    }
    if (offset !== undefined) {
      queryBuilder.skip(offset);
    }

    const roles = await queryBuilder.getMany();
    return roles.map((role) => RoleOrmMapper.toDomain(role));
  }

  async count(): Promise<number> {
    return this.roleRepo.count();
  }

  async findById(id: RoleId): Promise<Role | null> {
    const entity = await this.roleRepo.findOne({
      where: { id: id.getValue() },
      relations: ["permissions"],
    });
    if (!entity) {
      return null;
    }
    return RoleOrmMapper.toDomain(entity);
  }

  async save(role: Role): Promise<void> {
    const permissionCodes = role.getPermissions().map((p) => p.getValue());
    const permissions = permissionCodes.length
      ? await this.permissionRepo.find({ where: { code: In(permissionCodes) } })
      : [];

    if (permissions.length !== permissionCodes.length) {
      throwConflict("One or more permissions are missing from catalog");
    }

    const existing = await this.roleRepo.findOne({
      where: { id: role.getId().getValue() },
      relations: ["permissions"],
    });

    const entity = RoleOrmMapper.toOrm(
      role,
      permissions,
      existing ?? undefined,
    );
    await this.roleRepo.save(entity);
  }

  async delete(role: Role): Promise<void> {
    if (!role.canDelete()) {
      throwInvalidOperation(
        "Cannot delete super admin role",
        "delete_role",
        "Super admin role is protected",
      );
    }
    await this.roleRepo.delete(role.getId().getValue());
  }

  async exists(role: Role): Promise<boolean> {
    const count = await this.roleRepo.count({
      where: { id: role.getId().getValue() },
    });
    return count > 0;
  }
}
