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
   * In production this should be wired to Kafka topic (e.g. notification.password-reset).
   * Here we reuse Nest EventEmitter to keep contract explicit.
   */
  @OnEvent("notification.password-reset.requested")
  async handle(event: PasswordResetRequestedEvent): Promise<void> {
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
