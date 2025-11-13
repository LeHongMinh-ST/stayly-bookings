/**
 * Session aggregate manages refresh token lifecycle for authenticated principals
 */
import { BaseEntity } from '../../../../common/domain/entities/base.entity';
import { RefreshToken } from '../value-objects/refresh-token.vo';
import { SessionIssuedEvent } from '../events/session-issued.event';
import { SessionRevokedEvent } from '../events/session-revoked.event';
import { SessionId } from '../value-objects/session-id.vo';

export interface CreateSessionProps {
  id: SessionId;
  userId: string;
  userType: 'user' | 'customer';
  refreshToken: RefreshToken;
  userAgent?: string | null;
  ipAddress?: string | null;
  revokedAt?: Date | null;
}

export class Session extends BaseEntity<SessionId> {
  private revokedAt: Date | null;

  private constructor(
    id: SessionId,
    private readonly userId: string,
    private readonly userType: 'user' | 'customer',
    private refreshToken: RefreshToken,
    private readonly userAgent: string | null,
    private readonly ipAddress: string | null,
    revokedAt: Date | null,
  ) {
    super(id);
    this.revokedAt = revokedAt;
  }

  static create(props: CreateSessionProps): Session {
    const session = new Session(
      props.id,
      props.userId,
      props.userType,
      props.refreshToken,
      props.userAgent ?? null,
      props.ipAddress ?? null,
      props.revokedAt ?? null,
    );

    session.recordEvent(
      new SessionIssuedEvent(
        session.getId().getValue(),
        session.userId,
        new Date(),
      ),
    );
    return session;
  }

  static rehydrate(props: {
    id: SessionId;
    userId: string;
    userType: 'user' | 'customer';
    refreshToken: RefreshToken;
    userAgent: string | null;
    ipAddress: string | null;
    revokedAt: Date | null;
  }): Session {
    return new Session(
      props.id,
      props.userId,
      props.userType,
      props.refreshToken,
      props.userAgent,
      props.ipAddress,
      props.revokedAt,
    );
  }

  rotateToken(nextToken: RefreshToken): void {
    this.refreshToken = nextToken;
  }

  revoke(at: Date): void {
    if (this.revokedAt) {
      return;
    }
    this.revokedAt = at;
    this.recordEvent(
      new SessionRevokedEvent(this.getId().getValue(), this.userId, at),
    );
  }

  isActive(referenceDate: Date = new Date()): boolean {
    if (this.revokedAt) {
      return false;
    }
    return this.refreshToken.getExpiresAt().getTime() > referenceDate.getTime();
  }

  getId(): SessionId {
    return super.getId();
  }

  getUserId(): string {
    return this.userId;
  }

  getUserType(): 'user' | 'customer' {
    return this.userType;
  }

  getRefreshToken(): RefreshToken {
    return this.refreshToken;
  }

  getUserAgent(): string | null {
    return this.userAgent;
  }

  getIpAddress(): string | null {
    return this.ipAddress;
  }

  getRevokedAt(): Date | null {
    return this.revokedAt;
  }
}
