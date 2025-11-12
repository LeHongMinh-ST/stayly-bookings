/**
 * SessionOrmMapper bridges Session aggregate with ORM entity
 */
import { RefreshToken } from '../../../domain/value-objects/refresh-token.vo';
import { Session } from '../../../domain/entities/session.entity';
import { SessionOrmEntity } from '../entities/session.orm-entity';

export class SessionOrmMapper {
  static toDomain(entity: SessionOrmEntity): Session {
    const refreshToken = RefreshToken.create(
      entity.refreshToken,
      entity.refreshTokenExpiresAt,
      entity.tokenId,
    );

    return Session.rehydrate({
      id: entity.id,
      userId: entity.userId,
      refreshToken,
      userAgent: entity.userAgent,
      ipAddress: entity.ipAddress,
      createdAt: entity.createdAt,
      revokedAt: entity.revokedAt,
    });
  }

  static toOrm(session: Session, existing?: SessionOrmEntity): SessionOrmEntity {
    const entity = existing ?? new SessionOrmEntity();
    entity.id = session.getId();
    entity.userId = session.getUserId();
    entity.tokenId = session.getRefreshToken().getTokenId();
    entity.refreshToken = session.getRefreshToken().getValue();
    entity.refreshTokenExpiresAt = session.getRefreshToken().getExpiresAt();
    entity.userAgent = session.getUserAgent();
    entity.ipAddress = session.getIpAddress();
    entity.revokedAt = session.getRevokedAt();
    entity.createdAt = session.getCreatedAt();
    return entity;
  }
}
