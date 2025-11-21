/**
 * NotificationLogMapper converts between domain aggregate and ORM entity
 */
import { Notification } from "../../../domain/entities/notification.entity";
import { NotificationLogOrmEntity } from "../entities/notification-log.orm-entity";

export class NotificationLogMapper {
  static toOrm(
    notification: Notification,
    existing?: NotificationLogOrmEntity,
  ): NotificationLogOrmEntity {
    const entity = existing ?? new NotificationLogOrmEntity();
    entity.id = notification.getId().getValue();
    entity.channel = notification.getChannel();
    entity.templateKey = notification.getTemplateKey().getValue();
    entity.recipient = {
      email: notification.getRecipient().email ?? null,
      phone: notification.getRecipient().phone ?? null,
      displayName: notification.getRecipient().displayName ?? null,
    };
    entity.payload = notification.getPayload().toJSON();
    entity.metadata = notification.getMetadata();
    entity.status = notification.getStatus();
    entity.attempts = notification.getAttempts();
    entity.scheduledAt = notification.getScheduledAt();
    entity.lastAttemptAt = notification.getLastAttemptAt();
    entity.sentAt = notification.getSentAt();
    entity.errorMessage = notification.getErrorMessage();
    return entity;
  }
}
