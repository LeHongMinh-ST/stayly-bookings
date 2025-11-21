/**
 * CompletePasswordResetCommand finalizes reset by setting new password
 */
import type { PasswordResetSubjectType } from "../../domain/types/password-reset.types";

export class CompletePasswordResetCommand {
  constructor(
    public readonly requestId: string,
    public readonly token: string,
    public readonly newPassword: string,
    public readonly subjectType: PasswordResetSubjectType,
  ) {}
}
