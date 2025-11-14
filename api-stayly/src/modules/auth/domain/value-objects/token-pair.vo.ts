/**
 * TokenPair groups access and refresh tokens issued during authentication
 */
import { AccessToken } from "./access-token.vo";
import { RefreshToken } from "./refresh-token.vo";

export class TokenPair {
  constructor(
    public readonly accessToken: AccessToken,
    public readonly refreshToken: RefreshToken,
  ) {}
}
