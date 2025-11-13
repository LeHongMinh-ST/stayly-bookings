/**
 * SessionOrmMapper bridges Session aggregate with ORM entity
 */
import { RefreshToken } from '../../../domain/value-objects/refresh-token.vo';
import { Session } from '../../../domain/entities/session.entity';
import { SessionOrmEntity } from '../entities/session.orm-entity';
import { SessionId } from '../../../domain/value-objects/session-id.vo';

export class SessionOrmMapper {
  static toDomain(entity: SessionOrmEntity): Session {
    const refreshToken = RefreshToken.create(
      entity.refreshToken,
      entity.refreshTokenExpiresAt,
      entity.tokenId,
    );

    return Session.rehydrate({
      id: SessionId.create(entity.id),
      userId: entity.userId,
      userType: entity.userType,
      refreshToken,
      userAgent: entity.userAgent,
      ipAddress: entity.ipAddress,
      revokedAt: entity.revokedAt,
    });
  }

  static toOrm(
    session: Session,
    existing?: SessionOrmEntity,
  ): SessionOrmEntity {
    const entity = existing ?? new SessionOrmEntity();
    entity.id = session.getId().getValue();
    entity.userId = session.getUserId();
    entity.userType = session.getUserType();
    entity.tokenId = session.getRefreshToken().getTokenId();
    entity.refreshToken = session.getRefreshToken().getValue();
    entity.refreshTokenExpiresAt = session.getRefreshToken().getExpiresAt();
    entity.userAgent = session.getUserAgent();
    entity.ipAddress = session.getIpAddress();
    entity.revokedAt = session.getRevokedAt();
    return entity;
  }
}
