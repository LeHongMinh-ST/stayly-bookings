/**
 * NotificationRepository persists notification logs via TypeORM
 */
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";

import { Notification } from "../../../domain/entities/notification.entity";
import type { INotificationRepository } from "../../../domain/repositories/notification.repository.interface";
import { NotificationLogOrmEntity } from "../entities/notification-log.orm-entity";
import { NotificationLogMapper } from "../mappers/notification.mapper";
import { NotificationId } from "../../../domain/value-objects/notification-id.vo";
import { NotificationTemplateKey } from "../../../domain/value-objects/notification-template.vo";
import { NotificationRecipient } from "../../../domain/value-objects/notification-recipient.vo";
import { NotificationPayload } from "../../../domain/value-objects/notification-payload.vo";
import { NotificationChannel } from "../../../domain/value-objects/notification-channel.vo";
import { NotificationStatus } from "../../../domain/value-objects/notification-status.vo";

@Injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(
    @InjectRepository(NotificationLogOrmEntity)
    private readonly repo: Repository<NotificationLogOrmEntity>,
  ) {}

  async save(notification: Notification): Promise<void> {
    const entity = NotificationLogMapper.toOrm(notification);
    await this.repo.save(entity);
  }

  async findById(id: string): Promise<Notification | null> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      return null;
    }
    return Notification.rehydrate({
      id: NotificationId.create(entity.id),
      channel: entity.channel as NotificationChannel,
      templateKey: NotificationTemplateKey.create(entity.templateKey),
      recipient: new NotificationRecipient(
        (entity.recipient?.email as string | undefined) ?? null,
        (entity.recipient?.phone as string | undefined) ?? null,
        (entity.recipient?.displayName as string | undefined) ?? null,
      ),
      payload: NotificationPayload.create(entity.payload ?? {}),
      metadata: entity.metadata ?? null,
      scheduledAt: entity.scheduledAt,
      status: entity.status as NotificationStatus,
      attempts: entity.attempts,
      lastAttemptAt: entity.lastAttemptAt,
      sentAt: entity.sentAt,
      errorMessage: entity.errorMessage,
    });
  }
}
