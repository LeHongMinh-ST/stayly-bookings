/**
 * JWT Customer Strategy
 * Validates JWT tokens for Customer authentication
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { bearerTokenExtractor } from './utils/bearer-token-extractor';

type JwtCustomerClaims = {
  sub: string;
  email: string;
  roles?: string[];
  permissions?: string[];
  userType?: 'user' | 'customer';
};

@Injectable()
export class JwtCustomerStrategy extends PassportStrategy(
  Strategy,
  'jwt-customer',
) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('jwt.secret');
    if (!secret) {
      throw new Error('jwt.secret is not configured');
    }
    super({
      jwtFromRequest: bearerTokenExtractor,
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: JwtCustomerClaims) {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Only allow customer type, reject user (admin/staff)
    if (
      payload.userType === 'user' ||
      (!payload.userType && payload.roles?.some((role) => role !== 'customer'))
    ) {
      throw new UnauthorizedException(
        'Admin tokens are not allowed for customer endpoints',
      );
    }

    return {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles ?? ['customer'],
      permissions: payload.permissions ?? [],
      userType: payload.userType ?? 'customer',
    };
  }
}
