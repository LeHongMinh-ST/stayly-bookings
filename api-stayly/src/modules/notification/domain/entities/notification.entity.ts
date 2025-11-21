/**
 * Notification aggregate tracks delivery lifecycle for outbound messages
 */
import { BaseEntity } from "../../../../common/domain/entities/base.entity";
import { InvalidOperationError } from "../../../../common/domain/errors";
import { NotificationId } from "../value-objects/notification-id.vo";
import { NotificationChannel } from "../value-objects/notification-channel.vo";
import { NotificationRecipient } from "../value-objects/notification-recipient.vo";
import { NotificationTemplateKey } from "../value-objects/notification-template.vo";
import { NotificationPayload } from "../value-objects/notification-payload.vo";
import { NotificationStatus } from "../value-objects/notification-status.vo";

export interface NotificationProps {
  id: NotificationId;
  channel: NotificationChannel;
  templateKey: NotificationTemplateKey;
  recipient: NotificationRecipient;
  payload: NotificationPayload;
  metadata?: Record<string, unknown> | null;
  scheduledAt?: Date | null;
}

interface NotificationState extends NotificationProps {
  status: NotificationStatus;
  attempts: number;
  lastAttemptAt: Date | null;
  sentAt: Date | null;
  errorMessage: string | null;
}

export class Notification extends BaseEntity<NotificationId> {
  private status: NotificationStatus;
  private readonly channel: NotificationChannel;
  private readonly templateKey: NotificationTemplateKey;
  private readonly recipient: NotificationRecipient;
  private readonly payload: NotificationPayload;
  private readonly metadata: Record<string, unknown> | null;
  private readonly scheduledAt: Date | null;
  private attempts: number;
  private lastAttemptAt: Date | null;
  private sentAt: Date | null;
  private errorMessage: string | null;

  private constructor(props: NotificationState) {
    super(props.id);
    this.channel = props.channel;
    this.templateKey = props.templateKey;
    this.recipient = props.recipient;
    this.payload = props.payload;
    this.metadata = props.metadata ?? null;
    this.scheduledAt = props.scheduledAt ?? null;
    this.status = props.status;
    this.attempts = props.attempts;
    this.lastAttemptAt = props.lastAttemptAt;
    this.sentAt = props.sentAt;
    this.errorMessage = props.errorMessage;
  }

  static create(props: NotificationProps): Notification {
    return new Notification({
      ...props,
      status: "pending",
      attempts: 0,
      lastAttemptAt: null,
      sentAt: null,
      errorMessage: null,
    });
  }

  static rehydrate(props: NotificationState): Notification {
    return new Notification(props);
  }

  markSent(at: Date): void {
    if (this.status === "failed") {
      throw new InvalidOperationError(
        "Cannot mark failed notification as sent",
        "status",
      );
    }
    this.status = "sent";
    this.sentAt = at;
    this.lastAttemptAt = at;
    this.attempts += 1;
    this.errorMessage = null;
  }

  markFailed(at: Date, reason: string): void {
    this.status = "failed";
    this.lastAttemptAt = at;
    this.attempts += 1;
    this.errorMessage = reason;
  }

  getChannel(): NotificationChannel {
    return this.channel;
  }

  getTemplateKey(): NotificationTemplateKey {
    return this.templateKey;
  }

  getRecipient(): NotificationRecipient {
    return this.recipient;
  }

  getPayload(): NotificationPayload {
    return this.payload;
  }

  getStatus(): NotificationStatus {
    return this.status;
  }

  getAttempts(): number {
    return this.attempts;
  }

  getMetadata(): Record<string, unknown> | null {
    return this.metadata;
  }

  getScheduledAt(): Date | null {
    return this.scheduledAt;
  }

  getLastAttemptAt(): Date | null {
    return this.lastAttemptAt;
  }

  getSentAt(): Date | null {
    return this.sentAt;
  }

  getErrorMessage(): string | null {
    return this.errorMessage;
  }
}
