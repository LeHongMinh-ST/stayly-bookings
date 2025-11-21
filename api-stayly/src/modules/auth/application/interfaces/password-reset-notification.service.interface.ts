/**
 * Password reset notification interface for sending OTP/link emails
 */
import type { PasswordResetSubjectType } from "../../domain/types/password-reset.types";

export interface PasswordResetNotificationPayload {
  email: string;
  subjectType: PasswordResetSubjectType;
  otp: string;
  token: string;
  requestId: string;
  expiresAt: Date;
  otpExpiresAt: Date;
}

export interface IPasswordResetNotificationService {
  sendResetInstructions(
    this: void,
    payload: PasswordResetNotificationPayload,
  ): Promise<void>;
}

export const PASSWORD_RESET_NOTIFICATION_SERVICE =
  "PASSWORD_RESET_NOTIFICATION_SERVICE";
