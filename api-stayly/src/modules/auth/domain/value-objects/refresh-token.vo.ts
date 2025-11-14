/**
 * RefreshToken value object represents long lived token for renewing access tokens
 */
import { InvalidInputError } from "../../../../common/domain/errors";

export class RefreshToken {
  private constructor(
    private readonly value: string,
    private readonly expiresAt: Date,
    private readonly tokenId: string,
  ) {}

  static create(value: string, expiresAt: Date, tokenId: string): RefreshToken {
    if (!value || value.length < 20) {
      throw new InvalidInputError(
        "Refresh token must be at least 20 characters",
        "refreshToken",
        value,
      );
    }
    if (!expiresAt || Number.isNaN(expiresAt.getTime())) {
      throw new InvalidInputError(
        "Refresh token requires a valid expiration date",
        "expiresAt",
        expiresAt,
      );
    }
    if (!tokenId) {
      throw new InvalidInputError(
        "Refresh token requires tokenId correlation",
        "tokenId",
      );
    }
    return new RefreshToken(value, expiresAt, tokenId);
  }

  getValue(): string {
    return this.value;
  }

  getExpiresAt(): Date {
    return this.expiresAt;
  }

  getTokenId(): string {
    return this.tokenId;
  }
}
