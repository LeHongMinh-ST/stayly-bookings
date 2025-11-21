/**
 * NotificationService orchestrates aggregate creation, persistence and provider dispatch
 */
import { Inject, Injectable, Logger } from "@nestjs/common";
import { randomUUID } from "crypto";

import {
  DispatchNotificationRequest,
  INotificationService,
} from "../interfaces/notification-service.interface";
import {
  EMAIL_PROVIDER,
  IEmailProvider,
} from "../interfaces/email-provider.interface";
import {
  INotificationRepository,
  NOTIFICATION_REPOSITORY,
} from "../../domain/repositories/notification.repository.interface";
import { Notification } from "../../domain/entities/notification.entity";
import { NotificationId } from "../../domain/value-objects/notification-id.vo";
import { NotificationTemplateKey } from "../../domain/value-objects/notification-template.vo";

@Injectable()
export class NotificationService implements INotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
    @Inject(EMAIL_PROVIDER)
    private readonly emailProvider: IEmailProvider,
  ) {}

  /**
   * Dispatch notification through the appropriate provider
   */
  async dispatch(request: DispatchNotificationRequest): Promise<void> {
    const notification = Notification.create({
      id: NotificationId.create(randomUUID()),
      channel: request.channel,
      templateKey: NotificationTemplateKey.create(request.templateKey),
      recipient: request.recipient,
      payload: request.payload,
      metadata: request.metadata ?? null,
    });

    await this.notificationRepository.save(notification);

    try {
      if (request.channel !== "email") {
        notification.markFailed(
          new Date(),
          `Unsupported channel ${request.channel}`,
        );
      } else {
        await this.emailProvider.send({
          templateKey: request.templateKey,
          recipient: request.recipient,
          variables: request.payload.toJSON(),
        });
        notification.markSent(new Date());
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to dispatch notification ${notification.getId().getValue()}: ${message}`,
      );
      notification.markFailed(new Date(), message);
      throw error;
    } finally {
      await this.notificationRepository.save(notification);
    }
  }
}
