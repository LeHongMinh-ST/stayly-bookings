/**
 * JWT Customer Strategy
 * Validates JWT tokens for Customer authentication
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtCustomerStrategy extends PassportStrategy(
  Strategy,
  'jwt-customer',
) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: any) {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Only allow customer type, reject user (admin/staff)
    if (
      payload.userType === 'user' ||
      (!payload.userType &&
        payload.roles?.some((r: string) => r !== 'customer'))
    ) {
      throw new UnauthorizedException(
        'Admin tokens are not allowed for customer endpoints',
      );
    }

    return {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles || ['customer'],
      permissions: payload.permissions || [],
      userType: payload.userType || 'customer',
    };
  }
}
