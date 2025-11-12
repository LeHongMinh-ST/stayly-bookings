/**
 * JwtTokenService issues and verifies JWT access/refresh tokens
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '../../../../common/application/interfaces/token-service.interface';
import { JwtPayload } from '../../domain/value-objects/jwt-payload.vo';
import { AccessToken } from '../../domain/value-objects/access-token.vo';
import { RefreshToken } from '../../domain/value-objects/refresh-token.vo';
import { TokenPair } from '../../domain/value-objects/token-pair.vo';

@Injectable()
export class JwtTokenService implements TokenService {
  private readonly refreshSecret: string;
  private readonly accessExpiresInSeconds: number;
  private readonly refreshExpiresInSeconds: number;
  private readonly refreshExpiresInRaw: string | number;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.refreshSecret = this.configService.get<string>('jwt.refreshSecret');
    this.refreshExpiresInRaw = this.configService.get<string | number>(
      'jwt.refreshExpiresIn',
    );
    this.accessExpiresInSeconds = this.resolveSeconds(
      this.configService.get<string | number>('jwt.expiresIn'),
    );
    this.refreshExpiresInSeconds = this.resolveSeconds(this.refreshExpiresInRaw);
  }

  async issueAccessToken(payload: JwtPayload): Promise<AccessToken> {
    const token = await this.jwtService.signAsync(payload.getProps(), {
      expiresIn: this.accessExpiresInSeconds,
    });
    return AccessToken.create(token, this.accessExpiresInSeconds);
  }

  async issueRefreshToken(payload: JwtPayload): Promise<RefreshToken> {
    const token = await this.jwtService.signAsync(payload.getProps(), {
      secret: this.refreshSecret,
      expiresIn: this.refreshExpiresInRaw,
    });
    const expiresAt = new Date(Date.now() + this.refreshExpiresInSeconds * 1000);
    const props = payload.getProps();
    if (!props.tokenId) {
      throw new Error('Refresh token requires tokenId claim');
    }
    return RefreshToken.create(token, expiresAt, props.tokenId);
  }

  async issueTokenPair(payload: JwtPayload): Promise<TokenPair> {
    const [access, refresh] = await Promise.all([
      this.issueAccessToken(payload),
      this.issueRefreshToken(payload),
    ]);
    return new TokenPair(access, refresh);
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    const payload = await this.jwtService.verifyAsync(token, {
      secret: this.refreshSecret,
    });
    return JwtPayload.create({
      sub: payload.sub,
      email: payload.email,
      roles: payload.roles ?? [],
      permissions: payload.permissions ?? [],
      tokenId: payload.tokenId,
    });
  }

  private resolveSeconds(value: string | number | undefined): number {
    if (!value) {
      return 0;
    }
    if (typeof value === 'number') {
      return value;
    }

    const durationRegex = /^(\d+)([smhd])$/i;
    const match = value.match(durationRegex);
    if (!match) {
      return Number(value);
    }

    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case 's':
        return amount;
      case 'm':
        return amount * 60;
      case 'h':
        return amount * 60 * 60;
      case 'd':
        return amount * 60 * 60 * 24;
      default:
        return amount;
    }
  }
}
