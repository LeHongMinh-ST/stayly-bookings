/**
 * TokenResponseDto serializes access and refresh tokens for clients
 */
export class TokenResponseDto {
  constructor(
    public readonly accessToken: string,
    public readonly refreshToken: string,
    public readonly tokenType: string,
    public readonly expiresIn: number,
  ) {}
}
