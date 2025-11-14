/**
 * PermissionRepository provides lookup for permission catalog
 */
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { IPermissionRepository } from "../../../domain/repositories/permission.repository.interface";
import { Permission } from "../../../domain/value-objects/permission.vo";
import { PermissionOrmEntity } from "../entities/permission.orm-entity";

@Injectable()
export class PermissionRepository implements IPermissionRepository {
  constructor(
    @InjectRepository(PermissionOrmEntity)
    private readonly permissionRepo: Repository<PermissionOrmEntity>,
  ) {}

  async findAll(
    limit?: number,
    offset?: number,
    search?: string,
  ): Promise<Permission[]> {
    const queryBuilder = this.permissionRepo
      .createQueryBuilder("permission")
      .orderBy("permission.code", "ASC");

    if (search) {
      queryBuilder.where("permission.code LIKE :search", {
        search: `%${search}%`,
      });
    }

    if (limit !== undefined) {
      queryBuilder.take(limit);
    }
    if (offset !== undefined) {
      queryBuilder.skip(offset);
    }

    const permissions = await queryBuilder.getMany();
    return permissions.map((permission) => Permission.create(permission.code));
  }

  async count(search?: string): Promise<number> {
    const queryBuilder = this.permissionRepo.createQueryBuilder("permission");

    if (search) {
      queryBuilder.where("permission.code LIKE :search", {
        search: `%${search}%`,
      });
    }

    return queryBuilder.getCount();
  }

  async findByCodes(codes: string[]): Promise<Permission[]> {
    if (!codes.length) {
      return [];
    }
    const normalizedCodes = codes.map((code) => code.toLowerCase());
    const permissions = await this.permissionRepo.find({
      where: { code: In(normalizedCodes) },
    });
    return permissions.map((permission) => Permission.create(permission.code));
  }

  async findById(id: string): Promise<Permission | null> {
    const permission = await this.permissionRepo.findOne({
      where: { id },
    });
    if (!permission) {
      return null;
    }
    return Permission.create(permission.code);
  }
}
