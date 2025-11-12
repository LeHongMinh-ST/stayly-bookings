/**
 * RefreshTokenCommand handles renewals of token pairs using refresh token
 */
export class RefreshTokenCommand {
  constructor(
    public readonly refreshToken: string,
    public readonly userAgent?: string | null,
    public readonly ipAddress?: string | null,
  ) {}
}
