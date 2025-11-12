/**
 * RefreshToken value object represents long lived token for renewing access tokens
 */
export class RefreshToken {
  private constructor(
    private readonly value: string,
    private readonly expiresAt: Date,
    private readonly tokenId: string,
  ) {}

  static create(value: string, expiresAt: Date, tokenId: string): RefreshToken {
    if (!value || value.length < 20) {
      throw new Error('Refresh token must be at least 20 characters');
    }
    if (!expiresAt || Number.isNaN(expiresAt.getTime())) {
      throw new Error('Refresh token requires a valid expiration date');
    }
    if (!tokenId) {
      throw new Error('Refresh token requires tokenId correlation');
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
