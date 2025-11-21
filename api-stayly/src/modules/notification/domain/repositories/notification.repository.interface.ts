/**
 * INotificationRepository persists notification aggregates for audit & retry
 */
import { Notification } from "../entities/notification.entity";

export interface INotificationRepository {
  save(notification: Notification): Promise<void>;
  findById(id: string): Promise<Notification | null>;
}

export const NOTIFICATION_REPOSITORY = "NOTIFICATION_REPOSITORY";
