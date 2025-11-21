/**
 * PasswordResetNotificationService currently logs payload for integration hooks
 */
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type {
  IPasswordResetNotificationService,
  PasswordResetNotificationPayload,
} from "../../application/interfaces/password-reset-notification.service.interface";

@Injectable()
export class PasswordResetNotificationService
  implements IPasswordResetNotificationService
{
  private readonly logger = new Logger(PasswordResetNotificationService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Sends reset instruction via configured channel
   * Currently logs payload for future email/SMS integration
   */
  sendResetInstructions(
    payload: PasswordResetNotificationPayload,
  ): Promise<void> {
    const link = this.buildResetLink(payload);
    this.logger.log(
      `Password reset notification scheduled for ${payload.email} (${payload.subjectType})`,
    );
    this.logger.debug({
      link,
      otp: payload.otp,
      requestId: payload.requestId,
      expiresAt: payload.expiresAt,
      otpExpiresAt: payload.otpExpiresAt,
    });
    // TODO: integrate with real email/SMS provider
    return Promise.resolve();
  }

  private buildResetLink(payload: PasswordResetNotificationPayload): string {
    const baseUrl =
      this.configService.get<string>("auth.passwordReset.baseUrl") ??
      "https://app.stayly.io/reset-password";
    try {
      const url = new URL(baseUrl);
      url.searchParams.set("token", payload.token);
      url.searchParams.set("requestId", payload.requestId);
      url.searchParams.set("type", payload.subjectType);
      return url.toString();
    } catch (error) {
      this.logger.error(
        `Failed to construct password reset URL (${baseUrl}): ${error}`,
      );
      return baseUrl;
    }
  }
}
