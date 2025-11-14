/**
 * JWT Customer Guard
 * Validates JWT tokens for Customer routes only
 */
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

type JwtCustomerPayload = {
  userType?: 'user' | 'customer';
  roles?: string[];
} & Record<string, unknown>;

@Injectable()
export class JwtCustomerGuard extends AuthGuard('jwt-customer') {
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

  handleRequest<TUser extends JwtCustomerPayload>(
    err: unknown,
    user?: TUser,
  ): TUser {
    if (err || !user) {
      if (err instanceof Error) {
        throw err;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (user.userType !== 'customer' && !user.roles?.includes('customer')) {
      throw new UnauthorizedException(
        'Admin tokens are not allowed for customer endpoints',
      );
    }

    return user;
  }
}
