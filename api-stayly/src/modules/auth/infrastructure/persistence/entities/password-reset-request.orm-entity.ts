/**
 * PasswordResetRequestOrmEntity persists combined OTP/link reset workflow
 */
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import type {
  PasswordResetStatus,
  PasswordResetSubjectType,
} from "../../../domain/types/password-reset.types";

@Entity({ name: "auth_password_reset_requests" })
@Index("idx_auth_password_reset_subject_status", [
  "subjectId",
  "subjectType",
  "status",
])
@Index("idx_auth_password_reset_expiry", ["expiresAt"])
export class PasswordResetRequestOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "subject_id", type: "uuid" })
  subjectId!: string;

  @Column({ name: "subject_type", type: "varchar", length: 20 })
  subjectType!: PasswordResetSubjectType;

  @Index("uk_auth_password_reset_token_hash", { unique: true })
  @Column({ name: "token_hash", type: "varchar", length: 191, unique: true })
  tokenHash!: string;

  @Column({ name: "otp_hash", type: "varchar", length: 191 })
  otpHash!: string;

  @Column({ name: "status", type: "varchar", length: 20 })
  status!: PasswordResetStatus;

  @Column({ name: "attempt_count", type: "int" })
  attemptCount!: number;

  @Column({ name: "max_attempts", type: "int" })
  maxAttempts!: number;

  @Column({ name: "expires_at", type: "timestamp with time zone" })
  expiresAt!: Date;

  @Column({ name: "otp_expires_at", type: "timestamp with time zone" })
  otpExpiresAt!: Date;

  @Column({
    name: "verified_at",
    type: "timestamp with time zone",
    nullable: true,
  })
  verifiedAt!: Date | null;

  @Column({
    name: "completed_at",
    type: "timestamp with time zone",
    nullable: true,
  })
  completedAt!: Date | null;

  @Column({
    name: "revoked_at",
    type: "timestamp with time zone",
    nullable: true,
  })
  revokedAt!: Date | null;

  @Column({
    name: "last_attempt_at",
    type: "timestamp with time zone",
    nullable: true,
  })
  lastAttemptAt!: Date | null;

  @Column({ name: "requested_ip", type: "varchar", length: 64, nullable: true })
  requestedIp!: string | null;

  @Column({
    name: "requested_user_agent",
    type: "varchar",
    length: 512,
    nullable: true,
  })
  requestedUserAgent!: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
