/**
 * LoggerEmailProvider logs payload instead of sending real emails.
 * Replace with SendGrid/Mailgun/AWS SES implementation in production.
 */
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type {
  EmailProviderSendOptions,
  IEmailProvider,
} from "../../../application/interfaces/email-provider.interface";

@Injectable()
export class LoggerEmailProvider implements IEmailProvider {
  private readonly logger = new Logger(LoggerEmailProvider.name);

  constructor(private readonly configService: ConfigService) {}

  send(options: EmailProviderSendOptions): Promise<void> {
    this.logger.log(
      `Sending email via logger provider (template=${options.templateKey})`,
    );
    this.logger.debug({
      from:
        this.configService.get<string>("notification.email.sender") ??
        "no-reply@stayly.io",
      to: options.recipient.email,
      payload: options.variables,
    });
    return Promise.resolve();
  }
}
