/**
 * RolePermissionValidationService implements IRolePermissionValidationPort
 * Provides validation capabilities for roles and permissions
 */
import { Inject, Injectable } from '@nestjs/common';
import type { IRoleRepository } from '../../domain/repositories/role.repository.interface';
import { ROLE_REPOSITORY } from '../../domain/repositories/role.repository.interface';
import type { IPermissionRepository } from '../../domain/repositories/permission.repository.interface';
import { PERMISSION_REPOSITORY } from '../../domain/repositories/permission.repository.interface';
import type { IRolePermissionValidationPort } from '../../application/interfaces/role-permission-validation.port';

@Injectable()
export class RolePermissionValidationService
  implements IRolePermissionValidationPort
{
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async validateRoles(roleCodes: string[]): Promise<string[]> {
    if (!roleCodes.length) {
      throw new Error('At least one role is required');
    }

    const catalog = await this.roleRepository.findAll();
    const catalogValues = new Set<string>(
      catalog.map((role) => role.getCode()),
    );

    const unknownRoles = roleCodes.filter(
      (code) => !catalogValues.has(code.toLowerCase()),
    );

    if (unknownRoles.length) {
      throw new Error(`Unknown role(s): ${unknownRoles.join(', ')}`);
    }

    return roleCodes;
  }

  async validatePermissions(permissionCodes: string[]): Promise<string[]> {
    if (!permissionCodes.length) {
      return [];
    }

    const permissions =
      await this.permissionRepository.findByCodes(permissionCodes);
    const permissionValues = new Set<string>(
      permissions.map((permission) => permission.getValue()),
    );

    const unknownPermissions = permissionCodes.filter(
      (code) => !permissionValues.has(code.toLowerCase()),
    );

    if (unknownPermissions.length) {
      throw new Error(
        `Unknown permission(s): ${unknownPermissions.join(', ')}`,
      );
    }

    return permissionCodes;
  }
}

