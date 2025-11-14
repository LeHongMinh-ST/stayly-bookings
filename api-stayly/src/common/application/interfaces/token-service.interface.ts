/**
 * TokenService describes operations for issuing and verifying JWT tokens
 */

import { AccessToken } from "src/modules/auth/domain/value-objects/access-token.vo";
import { JwtPayload } from "src/modules/auth/domain/value-objects/jwt-payload.vo";
import { RefreshToken } from "src/modules/auth/domain/value-objects/refresh-token.vo";
import { TokenPair } from "src/modules/auth/domain/value-objects/token-pair.vo";

export interface TokenService {
  issueAccessToken(payload: JwtPayload): Promise<AccessToken>;
  issueRefreshToken(payload: JwtPayload): Promise<RefreshToken>;
  issueTokenPair(payload: JwtPayload): Promise<TokenPair>;
  verifyRefreshToken(token: string): Promise<JwtPayload>;
}

export const TOKEN_SERVICE = "TOKEN_SERVICE";
