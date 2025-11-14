/**
 * JWT User Strategy
 * Validates JWT tokens for User (admin/staff) authentication
 */
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { bearerTokenExtractor } from "./utils/bearer-token-extractor";
import type { RequestTokenExtractor } from "./utils/bearer-token-extractor";

type JwtStrategyOptions = {
  jwtFromRequest: RequestTokenExtractor;
  ignoreExpiration: boolean;
  secretOrKey: string;
};

type JwtUserClaims = {
  sub: string;
  email: string;
  roles?: string[];
  permissions?: string[];
  userType?: "user" | "customer";
};

@Injectable()
export class JwtUserStrategy extends PassportStrategy(Strategy, "jwt-user") {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>("jwt.secret");
    if (!secret) {
      throw new Error("jwt.secret is not configured");
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

  validate(payload: JwtUserClaims) {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException("Invalid token payload");
    }

    // Only allow user type (admin/staff), reject customer
    if (payload.userType === "customer") {
      throw new UnauthorizedException(
        "Customer tokens are not allowed for admin endpoints",
      );
    }

    return {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles ?? [],
      permissions: payload.permissions ?? [],
      userType: payload.userType ?? "user",
    };
  }
}
