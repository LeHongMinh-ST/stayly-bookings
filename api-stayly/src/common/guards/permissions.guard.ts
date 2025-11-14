/**
 * Permissions Guard
 * Validates user permissions for route access
 * Only applies to user (admin/staff), not customer
 * Super admin automatically has full permissions
 * Supports wildcard permission '*:manage' for full access
 * Loads permissions dynamically from database (real-time)
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import type { IRoleRepository } from '../../modules/rbac/domain/repositories/role.repository.interface';
import { ROLE_REPOSITORY } from '../../modules/rbac/domain/repositories/role.repository.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No permissions required
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      return false;
    }

    // Only apply permission check to user (admin/staff), not customer
    // Customer endpoints should use JwtCustomerGuard without permission checks
    if (user.userType === 'customer') {
      return false; // Permissions guard only for user type
    }

    // Super admin automatically has full permissions
    const userRoles = user.roles || [];
    if (userRoles.includes('super_admin')) {
      return true;
    }

    // Load permissions from database (real-time)
    // This merges permissions from roles and direct user permissions
    const allPermissions = await this.loadUserPermissions(
      userRoles,
      user.permissions || [],
    );

    // Check if user has wildcard permission '*:manage' for full access
    if (allPermissions.includes('*:manage')) {
      return true;
    }

    // Check if user has all required permissions
    return requiredPermissions.every((requiredPermission) => {
      // Direct permission match
      if (allPermissions.includes(requiredPermission)) {
        return true;
      }

      // Check wildcard match: if required is 'module:action', check for 'module:*'
      const [module, action] = requiredPermission.split(':');
      if (module && action) {
        const wildcardPermission = `${module}:*`;
        if (allPermissions.includes(wildcardPermission)) {
          return true;
        }
      }

      return false;
    });
  }

  /**
   * Loads user permissions from database (real-time)
   * Merges permissions from roles and direct user permissions
   */
  private async loadUserPermissions(
    roleIds: string[],
    directPermissions: string[],
  ): Promise<string[]> {
    const allPermissions = new Set<string>(directPermissions);

    if (roleIds.length > 0) {
      // Load roles with permissions from database
      const roles = await this.roleRepository.findAll();
      const userRoles = roles.filter((role) =>
        roleIds.includes(role.getId().getValue()),
      );

      for (const role of userRoles) {
        const rolePermissions = role.getPermissions().map((p) => p.getValue());
        rolePermissions.forEach((perm) => allPermissions.add(perm));
      }
    }

    return Array.from(allPermissions);
  }
}
