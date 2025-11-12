/**
 * Session aggregate manages refresh token lifecycle for authenticated principals
 */
import { DomainEvent } from '../../../../common/domain/interfaces/domain-event.interface';
import { RefreshToken } from '../value-objects/refresh-token.vo';
import { SessionIssuedEvent } from '../events/session-issued.event';
import { SessionRevokedEvent } from '../events/session-revoked.event';

export interface CreateSessionProps {
  id: string;
  userId: string;
  refreshToken: RefreshToken;
  userAgent?: string | null;
  ipAddress?: string | null;
  createdAt?: Date;
  revokedAt?: Date | null;
}

export class Session {
  private domainEvents: DomainEvent[] = [];
  private createdAt: Date;
  private revokedAt: Date | null;

  private constructor(
    private readonly id: string,
    private readonly userId: string,
    private refreshToken: RefreshToken,
    private readonly userAgent: string | null,
    private readonly ipAddress: string | null,
    createdAt: Date,
    revokedAt: Date | null,
  ) {
    this.createdAt = createdAt;
    this.revokedAt = revokedAt;
  }

  static create(props: CreateSessionProps): Session {
    const createdAt = props.createdAt ?? new Date();
    const session = new Session(
      props.id,
      props.userId,
      props.refreshToken,
      props.userAgent ?? null,
      props.ipAddress ?? null,
      createdAt,
      props.revokedAt ?? null,
    );

    session.recordEvent(
      new SessionIssuedEvent(session.id, session.userId, createdAt),
    );
    return session;
  }

  static rehydrate(props: {
    id: string;
    userId: string;
    refreshToken: RefreshToken;
    userAgent: string | null;
    ipAddress: string | null;
    createdAt: Date;
    revokedAt: Date | null;
  }): Session {
    return new Session(
      props.id,
      props.userId,
      props.refreshToken,
      props.userAgent,
      props.ipAddress,
      props.createdAt,
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
    this.recordEvent(new SessionRevokedEvent(this.id, this.userId, at));
  }

  isActive(referenceDate: Date = new Date()): boolean {
    if (this.revokedAt) {
      return false;
    }
    return this.refreshToken.getExpiresAt().getTime() > referenceDate.getTime();
  }

  getId(): string {
    return this.id;
  }

  getUserId(): string {
    return this.userId;
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

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getRevokedAt(): Date | null {
    return this.revokedAt;
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents = [];
    return events;
  }

  private recordEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }
}
