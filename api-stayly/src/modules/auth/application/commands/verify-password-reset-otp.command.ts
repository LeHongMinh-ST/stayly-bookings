/**
 * VerifyPasswordResetOtpCommand validates OTP submission
 */
import type { PasswordResetSubjectType } from "../../domain/types/password-reset.types";

export class VerifyPasswordResetOtpCommand {
  constructor(
    public readonly requestId: string,
    public readonly otp: string,
    public readonly subjectType: PasswordResetSubjectType,
  ) {}
}
