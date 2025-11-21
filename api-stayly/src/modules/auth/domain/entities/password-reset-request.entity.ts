/**
 * PasswordResetRequest aggregate encapsulates OTP + token based reset flow
 */
import { BaseEntity } from "../../../../common/domain/entities/base.entity";
import {
  InvalidInputError,
  InvalidOperationError,
  InvalidStateError,
} from "../../../../common/domain/errors";
import { PasswordResetRequestedEvent } from "../events/password-reset-requested.event";
import type {
  PasswordResetStatus,
  PasswordResetSubjectType,
} from "../types/password-reset.types";
import { PasswordResetRequestId } from "../value-objects/password-reset-request-id.vo";

export interface CreatePasswordResetRequestProps {
  id: PasswordResetRequestId;
  subjectId: string;
  subjectType: PasswordResetSubjectType;
  tokenHash: string;
  otpHash: string;
  expiresAt: Date;
  otpExpiresAt: Date;
  maxAttempts: number;
  plainToken: string;
  plainOtp: string;
  requestedIp?: string | null;
  requestedUserAgent?: string | null;
}

export interface RehydratePasswordResetRequestProps {
  id: PasswordResetRequestId;
  subjectId: string;
  subjectType: PasswordResetSubjectType;
  tokenHash: string;
  otpHash: string;
  expiresAt: Date;
  otpExpiresAt: Date;
  status: PasswordResetStatus;
  attemptCount: number;
  maxAttempts: number;
  verifiedAt?: Date | null;
  completedAt?: Date | null;
  revokedAt?: Date | null;
  lastAttemptAt?: Date | null;
  requestedIp?: string | null;
  requestedUserAgent?: string | null;
}

export class PasswordResetRequest extends BaseEntity<PasswordResetRequestId> {
  private status: PasswordResetStatus;
  private attemptCount: number;
  private readonly maxAttempts: number;
  private verifiedAt: Date | null;
  private completedAt: Date | null;
  private revokedAt: Date | null;
  private lastAttemptAt: Date | null;

  private constructor(
    id: PasswordResetRequestId,
    private readonly subjectId: string,
    private readonly subjectType: PasswordResetSubjectType,
    private readonly tokenHash: string,
    private readonly otpHash: string,
    private readonly expiresAt: Date,
    private readonly otpExpiresAt: Date,
    status: PasswordResetStatus,
    attemptCount: number,
    maxAttempts: number,
    verifiedAt: Date | null,
    completedAt: Date | null,
    revokedAt: Date | null,
    lastAttemptAt: Date | null,
    private readonly requestedIp: string | null,
    private readonly requestedUserAgent: string | null,
  ) {
    super(id);
    if (maxAttempts <= 0) {
      throw new InvalidInputError(
        "Password reset max attempts must be greater than zero",
        "maxAttempts",
      );
    }

    this.status = status;
    this.attemptCount = attemptCount;
    this.maxAttempts = maxAttempts;
    this.verifiedAt = verifiedAt;
    this.completedAt = completedAt;
    this.revokedAt = revokedAt;
    this.lastAttemptAt = lastAttemptAt;
  }

  /**
   * Creates new password reset request and emits notification event
   */
  static create(props: CreatePasswordResetRequestProps): PasswordResetRequest {
    const request = new PasswordResetRequest(
      props.id,
      props.subjectId,
      props.subjectType,
      props.tokenHash,
      props.otpHash,
      props.expiresAt,
      props.otpExpiresAt,
      "pending",
      0,
      props.maxAttempts,
      null,
      null,
      null,
      null,
      props.requestedIp ?? null,
      props.requestedUserAgent ?? null,
    );

    request.recordEvent(
      new PasswordResetRequestedEvent(
        request.getId().getValue(),
        request.subjectId,
        request.subjectType,
        props.plainToken,
        props.plainOtp,
        request.expiresAt,
        request.otpExpiresAt,
      ),
    );

    return request;
  }

  /**
   * Rehydrates request from persistence layer
   */
  static rehydrate(
    props: RehydratePasswordResetRequestProps,
  ): PasswordResetRequest {
    return new PasswordResetRequest(
      props.id,
      props.subjectId,
      props.subjectType,
      props.tokenHash,
      props.otpHash,
      props.expiresAt,
      props.otpExpiresAt,
      props.status,
      props.attemptCount,
      props.maxAttempts,
      props.verifiedAt ?? null,
      props.completedAt ?? null,
      props.revokedAt ?? null,
      props.lastAttemptAt ?? null,
      props.requestedIp ?? null,
      props.requestedUserAgent ?? null,
    );
  }

  /**
   * Marks OTP as verified when code is correct and not expired
   */
  markOtpVerified(at: Date): void {
    if (this.status !== "pending") {
      throw new InvalidStateError(
        "OTP can only be verified for pending requests",
        "status",
      );
    }
    this.ensureLifecycleActive(at);
    this.status = "otp_verified";
    this.verifiedAt = at;
  }

  /**
   * Completes password reset once new password is set
   */
  markCompleted(at: Date): void {
    if (this.status !== "otp_verified") {
      throw new InvalidStateError(
        "Reset can only be completed after OTP verification",
        "status",
      );
    }
    if (this.isTokenExpired(at)) {
      throw new InvalidOperationError(
        "Cannot complete password reset with expired token",
        "expiresAt",
      );
    }
    this.status = "completed";
    this.completedAt = at;
  }

  /**
   * Registers failed OTP attempt and enforces max attempts policy
   */
  registerFailedOtpAttempt(at: Date): void {
    if (this.status !== "pending") {
      throw new InvalidStateError(
        "OTP attempts are only allowed for pending requests",
        "status",
      );
    }
    this.ensureLifecycleActive(at);
    this.attemptCount += 1;
    this.lastAttemptAt = at;

    if (this.attemptCount >= this.maxAttempts) {
      this.revoke(at);
    }
  }

  /**
   * Expires request when TTL reached
   */
  expire(at: Date): void {
    if (this.isFinalized()) {
      return;
    }
    this.status = "expired";
    this.revokedAt = at;
  }

  /**
   * Revokes request explicitly (security reasons or OTP abuse)
   */
  revoke(at: Date): void {
    if (this.status === "completed") {
      throw new InvalidStateError(
        "Cannot revoke completed reset request",
        "status",
      );
    }
    this.status = "revoked";
    this.revokedAt = at;
  }

  /**
   * Ensures request is still actionable (not expired or revoked)
   */
  private ensureLifecycleActive(reference: Date): void {
    if (this.isTokenExpired(reference) || this.isOtpExpired(reference)) {
      this.expire(reference);
      throw new InvalidOperationError(
        "Password reset request has expired",
        "expiresAt",
      );
    }
    if (this.status === "revoked") {
      throw new InvalidOperationError(
        "Password reset request has been revoked",
        "status",
      );
    }
  }

  /**
   * Checks if OTP lifetime elapsed
   */
  isOtpExpired(reference: Date = new Date()): boolean {
    return this.otpExpiresAt.getTime() <= reference.getTime();
  }

  /**
   * Checks if reset token lifetime elapsed
   */
  isTokenExpired(reference: Date = new Date()): boolean {
    return this.expiresAt.getTime() <= reference.getTime();
  }

  /**
   * Returns true when request is terminated and no actions allowed
   */
  isFinalized(): boolean {
    return ["completed", "expired", "revoked"].includes(this.status);
  }

  /**
   * Validates hashed OTP equality (hashing handled upstream)
   */
  isMatchingOtp(candidateHash: string): boolean {
    return this.otpHash === candidateHash;
  }

  /**
   * Validates hashed token equality
   */
  isMatchingToken(candidateHash: string): boolean {
    return this.tokenHash === candidateHash;
  }

  /**
   * Checks whether OTP attempts may continue
   */
  canAttemptOtp(reference: Date = new Date()): boolean {
    return (
      this.status === "pending" &&
      !this.isFinalized() &&
      !this.isOtpExpired(reference) &&
      !this.isTokenExpired(reference) &&
      this.attemptCount < this.maxAttempts
    );
  }

  getStatus(): PasswordResetStatus {
    return this.status;
  }

  getSubjectId(): string {
    return this.subjectId;
  }

  getSubjectType(): PasswordResetSubjectType {
    return this.subjectType;
  }

  getAttemptCount(): number {
    return this.attemptCount;
  }

  getMaxAttempts(): number {
    return this.maxAttempts;
  }

  getVerifiedAt(): Date | null {
    return this.verifiedAt;
  }

  getCompletedAt(): Date | null {
    return this.completedAt;
  }

  getRevokedAt(): Date | null {
    return this.revokedAt;
  }

  getLastAttemptAt(): Date | null {
    return this.lastAttemptAt;
  }

  getRequestedIp(): string | null {
    return this.requestedIp;
  }

  getRequestedUserAgent(): string | null {
    return this.requestedUserAgent;
  }

  getExpiresAt(): Date {
    return this.expiresAt;
  }

  getOtpExpiresAt(): Date {
    return this.otpExpiresAt;
  }

  getTokenHash(): string {
    return this.tokenHash;
  }

  getOtpHash(): string {
    return this.otpHash;
  }
}
