/**
 * JWT User Strategy
 * Validates JWT tokens for User (admin/staff) authentication
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtUserStrategy extends PassportStrategy(Strategy, 'jwt-user') {
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

    // Only allow user type (admin/staff), reject customer
    if (payload.userType === 'customer') {
      throw new UnauthorizedException(
        'Customer tokens are not allowed for admin endpoints',
      );
    }

    return {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles || [],
      permissions: payload.permissions || [],
      userType: payload.userType || 'user',
    };
  }
}
