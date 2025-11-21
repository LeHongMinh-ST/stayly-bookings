/**
 * NotificationKafkaConsumer listens to Kafka-emitted events (bridged via Nest EventEmitter)
 * and forwards them to the appropriate application handlers.
 */
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

import { PasswordResetNotificationHandler } from "../../application/handlers/password-reset-notification.handler";
import type { PasswordResetRequestedEvent } from "../../../auth/domain/events/password-reset-requested.event";

@Injectable()
export class NotificationKafkaConsumer {
  constructor(
    private readonly passwordResetHandler: PasswordResetNotificationHandler,
  ) {}

  /**
   * In the current setup, Kafka listener should emit `kafka.notification.password-reset`
   * whenever a password reset event is consumed from the topic.
   */
  @OnEvent("kafka.notification.password-reset")
  async handlePasswordResetMessage(
    payload: PasswordResetRequestedEvent,
  ): Promise<void> {
    await this.passwordResetHandler.handle(payload);
  }
}
