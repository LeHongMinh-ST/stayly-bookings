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
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import type { IRoleRepository } from '../../modules/rbac/domain/repositories/role.repository.interface';
import { ROLE_REPOSITORY } from '../../modules/rbac/domain/repositories/role.repository.interface';
import type { Request } from 'express';

type JwtUserContext = {
  userType?: 'user' | 'customer';
  roles?: string[];
  permissions?: string[];
};

type AuthenticatedRequest = Request & { user?: JwtUserContext };

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

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException('Missing authenticated user context');
    }

    // Only apply permission check to user (admin/staff), not customer
    // Customer endpoints should use JwtCustomerGuard without permission checks
    if (user.userType === 'customer') {
      return false; // Permissions guard only for user type
    }

    // Super admin automatically has full permissions
    const userRoles = Array.isArray(user.roles) ? user.roles : [];
    if (userRoles.includes('super_admin')) {
      return true;
    }

    // Load permissions from database (real-time)
    // This merges permissions from roles and direct user permissions
    const allPermissions = await this.loadUserPermissions(
      userRoles,
      Array.isArray(user.permissions) ? user.permissions : [],
    );
    const permissionSet = new Set(allPermissions);

    // Check if user has wildcard permission '*:manage' for full access
    if (permissionSet.has('*:manage')) {
      return true;
    }

    // Check if user has all required permissions
    return requiredPermissions.every((requiredPermission) => {
      if (!requiredPermission) {
        return false;
      }
      // Direct permission match
      if (permissionSet.has(requiredPermission)) {
        return true;
      }

      // Check wildcard match: if required is 'module:action', check for 'module:*'
      const [module, action] = requiredPermission.split(':');
      if (module && action) {
        const wildcardPermission = `${module}:*`;
        if (permissionSet.has(wildcardPermission)) {
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
    roleIds: readonly string[],
    directPermissions: readonly string[],
  ): Promise<string[]> {
    const permissions = new Set<string>(directPermissions);

    if (roleIds.length === 0) {
      return Array.from(permissions);
    }

    const roles = await this.roleRepository.findAll();
    for (const role of roles) {
      const roleId = role.getId().getValue();
      if (!roleIds.includes(roleId)) {
        continue;
      }
      role
        .getPermissions()
        .map((permission) => permission.getValue())
        .forEach((perm) => permissions.add(perm));
    }

    return Array.from(permissions);
  }
}
