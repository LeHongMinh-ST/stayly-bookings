/**
 * TokenService describes operations for issuing and verifying JWT tokens
 */
import { JwtPayload } from '../../bounded-contexts/auth/domain/value-objects/jwt-payload.vo';
import { AccessToken } from '../../bounded-contexts/auth/domain/value-objects/access-token.vo';
import { RefreshToken } from '../../bounded-contexts/auth/domain/value-objects/refresh-token.vo';
import { TokenPair } from '../../bounded-contexts/auth/domain/value-objects/token-pair.vo';

export interface TokenService {
  issueAccessToken(payload: JwtPayload): Promise<AccessToken>;
  issueRefreshToken(payload: JwtPayload): Promise<RefreshToken>;
  issueTokenPair(payload: JwtPayload): Promise<TokenPair>;
  verifyRefreshToken(token: string): Promise<JwtPayload>;
}

export const TOKEN_SERVICE = 'TOKEN_SERVICE';
