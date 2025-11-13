/**
 * RolePermissionSeedService provides seeding logic for roles and permissions
 */
import { Injectable, Logger } from '@nestjs/common';
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
  // User management permissions
  { code: 'user:create', description: 'Create administrative users' },
  { code: 'user:read', description: 'View administrative users' },
  { code: 'user:update', description: 'Update administrative users' },
  { code: 'user:delete', description: 'Delete administrative users' },
  {
    code: 'user:manage',
    description: 'Full user management (create, read, update, delete)',
  },
  // Customer management permissions
  { code: 'customer:create', description: 'Create customers' },
  { code: 'customer:read', description: 'View customers' },
  { code: 'customer:update', description: 'Update customers' },
  { code: 'customer:delete', description: 'Delete customers' },
  {
    code: 'customer:manage',
    description: 'Full customer management (create, read, update, delete)',
  },
  // Homestay/Hotel management permissions
  { code: 'homestay:create', description: 'Create homestays/hotels' },
  { code: 'homestay:read', description: 'View homestays/hotels' },
  { code: 'homestay:update', description: 'Update homestays/hotels' },
  { code: 'homestay:delete', description: 'Delete homestays/hotels' },
  { code: 'homestay:manage', description: 'Full homestay/hotel management' },
  // Room management permissions
  { code: 'room:create', description: 'Create rooms' },
  { code: 'room:read', description: 'View rooms' },
  { code: 'room:update', description: 'Update rooms' },
  { code: 'room:delete', description: 'Delete rooms' },
  { code: 'room:manage', description: 'Full room management' },
  // Booking management permissions
  { code: 'booking:create', description: 'Create bookings' },
  { code: 'booking:read', description: 'View bookings' },
  { code: 'booking:update', description: 'Update bookings' },
  { code: 'booking:cancel', description: 'Cancel bookings' },
  { code: 'booking:checkin', description: 'Perform check-in' },
  { code: 'booking:checkout', description: 'Perform check-out' },
  { code: 'booking:manage', description: 'Full booking management' },
  // Payment management permissions
  { code: 'payment:read', description: 'View payments' },
  { code: 'payment:process', description: 'Process payments' },
  { code: 'payment:refund', description: 'Process refunds' },
  { code: 'payment:manage', description: 'Full payment management' },
  // Report permissions
  { code: 'report:read', description: 'View reports' },
  { code: 'report:export', description: 'Export reports' },
  { code: 'report:manage', description: 'Full report management' },
  // Role and Permission management permissions
  { code: 'role:create', description: 'Create roles' },
  { code: 'role:read', description: 'View roles' },
  { code: 'role:update', description: 'Update roles' },
  { code: 'role:delete', description: 'Delete roles' },
  { code: 'role:assign', description: 'Assign roles to users' },
  { code: 'role:manage', description: 'Full role management' },
  { code: 'permission:read', description: 'View permissions' },
  {
    code: 'permission:assign',
    description: 'Assign permissions to users/roles',
  },
  { code: 'permission:manage', description: 'Full permission management' },
  // System configuration permissions
  { code: 'system:configure', description: 'Configure system settings' },
  { code: 'system:manage', description: 'Full system management' },
  // Wildcard permission for full access (only for super admin)
  {
    code: '*:manage',
    description: 'Full access to all modules (super admin only)',
  },
];

@Injectable()
export class RolePermissionSeedService {
  private readonly logger = new Logger(RolePermissionSeedService.name);

  constructor(
    @InjectRepository(RoleOrmEntity)
    private readonly roleRepo: Repository<RoleOrmEntity>,
    @InjectRepository(PermissionOrmEntity)
    private readonly permissionRepo: Repository<PermissionOrmEntity>,
  ) {}

  /**
   * Seeds default roles and permissions if missing
   */
  async seed(): Promise<void> {
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
      this.logger.log('All roles already exist');
      // Update is_super_admin flag for super_admin role if it exists
      await this.updateSuperAdminFlag();
      return;
    }

    // Insert missing roles with is_super_admin flag
    const rolesToInsert = missing.map((role) => ({
      ...role,
      isSuperAdmin: role.code === 'super_admin',
    }));
    await this.roleRepo.insert(rolesToInsert);
    this.logger.log(
      `Seeded roles: ${missing.map((role) => role.code).join(', ')}`,
    );

    // Update is_super_admin flag for super_admin role
    await this.updateSuperAdminFlag();
  }

  private async updateSuperAdminFlag(): Promise<void> {
    const superAdminRole = await this.roleRepo.findOne({
      where: { code: 'super_admin' },
    });
    if (superAdminRole && !superAdminRole.isSuperAdmin) {
      superAdminRole.isSuperAdmin = true;
      await this.roleRepo.save(superAdminRole);
      this.logger.log('Updated is_super_admin flag for super_admin role');
    }
  }

  private async ensurePermissions(): Promise<void> {
    const existingCodes = await this.permissionRepo.find({
      where: {
        code: In(DEFAULT_PERMISSIONS.map((permission) => permission.code)),
      },
      select: ['code'],
    });
    const existing = new Set(
      existingCodes.map((permission) => permission.code),
    );
    const missing = DEFAULT_PERMISSIONS.filter(
      (permission) => !existing.has(permission.code),
    );

    if (!missing.length) {
      this.logger.log('All permissions already exist');
      return;
    }

    await this.permissionRepo.insert(
      missing.map((permission) => ({ ...permission })),
    );
    this.logger.log(
      `Seeded permissions: ${missing.map((permission) => permission.code).join(', ')}`,
    );
  }
}
