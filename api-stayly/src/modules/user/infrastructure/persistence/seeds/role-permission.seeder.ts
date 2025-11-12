/**
 * RolePermissionSeeder ensures base roles and permissions exist
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { RoleOrmEntity } from '../entities/role.orm-entity';
import { PermissionOrmEntity } from '../entities/permission.orm-entity';

const DEFAULT_ROLES = [
  { code: 'super_admin', displayName: 'Super Admin' },
  { code: 'owner', displayName: 'Owner' },
  { code: 'manager', displayName: 'Manager' },
  { code: 'staff', displayName: 'Staff' },
];

const DEFAULT_PERMISSIONS = [
  { code: 'user:manage', description: 'Manage administrative users' },
  { code: 'user:read', description: 'View administrative users' },
  { code: 'customer:manage', description: 'Manage customers' },
  { code: 'customer:read', description: 'View customers' },
];

@Injectable()
export class RolePermissionSeeder implements OnModuleInit {
  private readonly logger = new Logger(RolePermissionSeeder.name);

  constructor(
    @InjectRepository(RoleOrmEntity)
    private readonly roleRepo: Repository<RoleOrmEntity>,
    @InjectRepository(PermissionOrmEntity)
    private readonly permissionRepo: Repository<PermissionOrmEntity>,
  ) {}

  /**
   * Seeds default roles and permissions if missing
   */
  async onModuleInit(): Promise<void> {
    await this.ensureRoles();
    await this.ensurePermissions();
  }

  private async ensureRoles(): Promise<void> {
    const existingCodes = await this.roleRepo.find({
      where: { code: In(DEFAULT_ROLES.map((role) => role.code)) },
      select: ['code'],
    });
    const existing = new Set(existingCodes.map((role) => role.code));
    const missing = DEFAULT_ROLES.filter((role) => !existing.has(role.code));

    if (!missing.length) {
      return;
    }

    await this.roleRepo.insert(missing.map((role) => ({ ...role })));
    this.logger.log(`Seeded roles: ${missing.map((role) => role.code).join(', ')}`);
  }

  private async ensurePermissions(): Promise<void> {
    const existingCodes = await this.permissionRepo.find({
      where: { code: In(DEFAULT_PERMISSIONS.map((permission) => permission.code)) },
      select: ['code'],
    });
    const existing = new Set(existingCodes.map((permission) => permission.code));
    const missing = DEFAULT_PERMISSIONS.filter((permission) => !existing.has(permission.code));

    if (!missing.length) {
      return;
    }

    await this.permissionRepo.insert(missing.map((permission) => ({ ...permission })));
    this.logger.log(
      `Seeded permissions: ${missing
        .map((permission) => permission.code)
        .join(', ')}`,
    );
  }
}
