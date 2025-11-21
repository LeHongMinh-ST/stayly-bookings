/**
 * PasswordResetNotificationHandler reacts to password reset events (Kafka/CQRS)
 * and dispatches email notifications through NotificationService
 */
import { Inject, Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

import type { PasswordResetRequestedEvent } from "../../../auth/domain/events/password-reset-requested.event";
import {
  NOTIFICATION_SERVICE,
  type INotificationService,
} from "../interfaces/notification-service.interface";
import { NotificationRecipient } from "../../domain/value-objects/notification-recipient.vo";
import { NotificationPayload } from "../../domain/value-objects/notification-payload.vo";

@Injectable()
export class PasswordResetNotificationHandler {
  constructor(
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationService: INotificationService,
  ) {}

  /**
   * Handles in-process events (legacy/internal flows)
   */
  @OnEvent("notification.password-reset.requested")
  async handleInProcess(event: PasswordResetRequestedEvent): Promise<void> {
    await this.dispatch(event);
  }

  /**
   * Handles events emitted by Kafka listener bridge
   */
  @OnEvent("kafka.notification.password-reset")
  async handleKafka(event: PasswordResetRequestedEvent): Promise<void> {
    await this.dispatch(event);
  }

  private async dispatch(event: PasswordResetRequestedEvent): Promise<void> {
    await this.notificationService.dispatch({
      channel: "email",
      templateKey: "password_reset",
      recipient: NotificationRecipient.email({ email: event.email }),
      payload: NotificationPayload.create({
        requestId: event.requestId,
        otp: event.otp,
        token: event.token,
        expiresAt: event.expiresAt.toISOString(),
        otpExpiresAt: event.otpExpiresAt.toISOString(),
      }),
      metadata: {
        subjectType: event.subjectType,
        subjectId: event.subjectId,
      },
    });
  }
}
