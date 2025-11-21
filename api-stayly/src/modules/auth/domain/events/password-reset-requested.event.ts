/**
 * PasswordResetRequestedEvent triggers outbound notification (email + OTP)
 * Contains only transient plaintext data required for notification delivery
 */
import { DomainEvent } from "../../../../common/domain/interfaces/domain-event.interface";
import type { PasswordResetSubjectType } from "../types/password-reset.types";

export class PasswordResetRequestedEvent implements DomainEvent {
  readonly name = "auth.password-reset.requested";

  constructor(
    public readonly requestId: string,
    public readonly subjectId: string,
    public readonly subjectType: PasswordResetSubjectType,
    public readonly token: string,
    public readonly otp: string,
    public readonly expiresAt: Date,
    public readonly otpExpiresAt: Date,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
