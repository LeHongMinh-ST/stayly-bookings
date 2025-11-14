/**
 * Roles Guard
 * Validates user roles for route access
 * Only applies to user (admin/staff), not customer
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { Request } from 'express';

type JwtUserContext = {
  userType?: 'user' | 'customer';
  roles?: string[];
};

type AuthenticatedRequest = Request & { user?: JwtUserContext };

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles required
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException('Missing authenticated user context');
    }

    // Only apply role check to user (admin/staff), not customer
    // Customer endpoints should use JwtCustomerGuard without role checks
    if (user.userType === 'customer') {
      return false; // Roles guard only for user type
    }

    // Check if user has at least one of the required roles
    const userRoles = Array.isArray(user.roles) ? user.roles : [];
    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
