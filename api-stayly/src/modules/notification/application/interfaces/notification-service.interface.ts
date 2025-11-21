/**
 * Notification service contract used by bounded contexts (auth, booking, etc.)
 */
import { NotificationChannel } from "../../domain/value-objects/notification-channel.vo";
import { NotificationPayload } from "../../domain/value-objects/notification-payload.vo";
import { NotificationRecipient } from "../../domain/value-objects/notification-recipient.vo";

export interface DispatchNotificationRequest {
  channel: NotificationChannel;
  templateKey: string;
  recipient: NotificationRecipient;
  payload: NotificationPayload;
  metadata?: Record<string, unknown>;
}

export interface INotificationService {
  dispatch(request: DispatchNotificationRequest): Promise<void>;
}

export const NOTIFICATION_SERVICE = "NOTIFICATION_SERVICE";
