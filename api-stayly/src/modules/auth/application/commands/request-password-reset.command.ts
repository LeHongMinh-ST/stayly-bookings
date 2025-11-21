/**
 * RequestPasswordResetCommand starts OTP + link reset flow
 */
import type { PasswordResetSubjectType } from "../../domain/types/password-reset.types";

export class RequestPasswordResetCommand {
  constructor(
    public readonly email: string,
    public readonly subjectType: PasswordResetSubjectType,
    public readonly userAgent: string | null,
    public readonly ipAddress: string | null,
  ) {}
}
