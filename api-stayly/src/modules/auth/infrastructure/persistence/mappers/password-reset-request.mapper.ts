/**
 * PasswordResetRequestOrmMapper converts between aggregate and ORM entity
 */
import { PasswordResetRequest } from "../../../domain/entities/password-reset-request.entity";
import { PasswordResetRequestId } from "../../../domain/value-objects/password-reset-request-id.vo";
import { PasswordResetRequestOrmEntity } from "../entities/password-reset-request.orm-entity";

export class PasswordResetRequestOrmMapper {
  static toDomain(entity: PasswordResetRequestOrmEntity): PasswordResetRequest {
    return PasswordResetRequest.rehydrate({
      id: PasswordResetRequestId.create(entity.id),
      subjectId: entity.subjectId,
      subjectType: entity.subjectType,
      tokenHash: entity.tokenHash,
      otpHash: entity.otpHash,
      expiresAt: entity.expiresAt,
      otpExpiresAt: entity.otpExpiresAt,
      status: entity.status,
      attemptCount: entity.attemptCount,
      maxAttempts: entity.maxAttempts,
      verifiedAt: entity.verifiedAt,
      completedAt: entity.completedAt,
      revokedAt: entity.revokedAt,
      lastAttemptAt: entity.lastAttemptAt,
      requestedIp: entity.requestedIp,
      requestedUserAgent: entity.requestedUserAgent,
    });
  }

  static toOrm(
    aggregate: PasswordResetRequest,
    existing?: PasswordResetRequestOrmEntity,
  ): PasswordResetRequestOrmEntity {
    const entity = existing ?? new PasswordResetRequestOrmEntity();
    entity.id = aggregate.getId().getValue();
    entity.subjectId = aggregate.getSubjectId();
    entity.subjectType = aggregate.getSubjectType();
    entity.tokenHash = aggregate.getTokenHash();
    entity.otpHash = aggregate.getOtpHash();
    entity.expiresAt = aggregate.getExpiresAt();
    entity.otpExpiresAt = aggregate.getOtpExpiresAt();
    entity.status = aggregate.getStatus();
    entity.attemptCount = aggregate.getAttemptCount();
    entity.maxAttempts = aggregate.getMaxAttempts();
    entity.verifiedAt = aggregate.getVerifiedAt();
    entity.completedAt = aggregate.getCompletedAt();
    entity.revokedAt = aggregate.getRevokedAt();
    entity.lastAttemptAt = aggregate.getLastAttemptAt();
    entity.requestedIp = aggregate.getRequestedIp();
    entity.requestedUserAgent = aggregate.getRequestedUserAgent();
    return entity;
  }
}
