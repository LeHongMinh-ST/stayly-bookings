/**
 * NotificationKafkaConsumer listens to Kafka topics and re-emits domain events
 * so that existing handlers (PasswordResetNotificationHandler) can stay decoupled.
 */
import { Controller, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { MessagePattern, Payload } from "@nestjs/microservices";

import { PasswordResetRequestedEvent } from "../../../auth/domain/events/password-reset-requested.event";
import type { PasswordResetSubjectType } from "../../../auth/domain/types/password-reset.types";

interface PasswordResetKafkaPayload {
  requestId: string;
  subjectId: string;
  subjectType: PasswordResetSubjectType;
  email: string;
  token: string;
  otp: string;
  expiresAt: string;
  otpExpiresAt: string;
  occurredAt?: string;
}

@Controller()
export class NotificationKafkaConsumer {
  private readonly logger = new Logger(NotificationKafkaConsumer.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Consumes Kafka topic (notification.password-reset) and emits internal event
   */
  @MessagePattern("notification.password-reset")
  handlePasswordResetMessage(
    @Payload() payload: PasswordResetKafkaPayload,
  ): void {
    const event = new PasswordResetRequestedEvent(
      payload.requestId,
      payload.subjectId,
      payload.subjectType,
      payload.email,
      payload.token,
      payload.otp,
      new Date(payload.expiresAt),
      new Date(payload.otpExpiresAt),
      payload.occurredAt ? new Date(payload.occurredAt) : new Date(),
    );
    this.logger.debug(
      `Kafka password reset event received for subject ${event.subjectId}`,
    );
    this.eventEmitter.emit("kafka.notification.password-reset", event);
  }
}
