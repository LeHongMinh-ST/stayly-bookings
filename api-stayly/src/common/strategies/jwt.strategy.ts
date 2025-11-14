/**
 * JWT Strategy
 * Validates JWT tokens using Passport
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { bearerTokenExtractor } from './utils/bearer-token-extractor';
import type { RequestTokenExtractor } from './utils/bearer-token-extractor';

type JwtStrategyOptions = {
  jwtFromRequest: RequestTokenExtractor;
  ignoreExpiration: boolean;
  secretOrKey: string;
};

type JwtClaims = {
  sub: string;
  email: string;
  roles?: string[];
  permissions?: string[];
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('jwt.secret');
    if (!secret) {
      throw new Error('jwt.secret is not configured');
    }
    const secretKey: string = secret;
    const options: JwtStrategyOptions = {
      jwtFromRequest: bearerTokenExtractor,
      ignoreExpiration: false,
      secretOrKey: secretKey,
    };
    // PassportStrategy factory currently has loose typings; force call
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super(options);
  }

  validate(payload: JwtClaims) {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles ?? [],
      permissions: payload.permissions ?? [],
    };
  }
}
