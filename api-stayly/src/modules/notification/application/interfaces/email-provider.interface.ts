/**
 * Email provider interface abstracts third-party transactional email services
 */
import { NotificationRecipient } from "../../domain/value-objects/notification-recipient.vo";

export interface EmailProviderSendOptions {
  templateKey: string;
  recipient: NotificationRecipient;
  variables: Record<string, unknown>;
}

export interface IEmailProvider {
  send(options: EmailProviderSendOptions): Promise<void>;
}

export const EMAIL_PROVIDER = "EMAIL_PROVIDER";
