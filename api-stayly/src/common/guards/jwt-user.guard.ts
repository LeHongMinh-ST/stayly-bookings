/**
 * JWT User Guard
 * Validates JWT tokens for User (admin/staff) routes only
 */
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

type JwtUserPayload = {
  userType?: 'user' | 'customer';
  roles?: string[];
} & Record<string, unknown>;

@Injectable()
export class JwtUserGuard extends AuthGuard('jwt-user') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TUser extends JwtUserPayload>(
    err: unknown,
    user?: TUser,
  ): TUser {
    if (err || !user) {
      if (err instanceof Error) {
        throw err;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (user.userType === 'customer') {
      throw new UnauthorizedException(
        'Customer tokens are not allowed for admin endpoints',
      );
    }

    return user;
  }
}
