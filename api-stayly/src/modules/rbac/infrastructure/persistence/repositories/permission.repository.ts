/**
 * PermissionRepository provides lookup for permission catalog
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { IPermissionRepository } from '../../../domain/repositories/permission.repository.interface';
import { Permission } from '../../../domain/value-objects/permission.vo';
import { PermissionOrmEntity } from '../entities/permission.orm-entity';

@Injectable()
export class PermissionRepository implements IPermissionRepository {
  constructor(
    @InjectRepository(PermissionOrmEntity)
    private readonly permissionRepo: Repository<PermissionOrmEntity>,
  ) {}

  async findAll(): Promise<Permission[]> {
    const permissions = await this.permissionRepo.find({
      order: { code: 'ASC' },
    });
    return permissions.map((permission) => Permission.create(permission.code));
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
