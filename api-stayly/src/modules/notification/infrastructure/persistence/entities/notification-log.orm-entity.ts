/**
 * NotificationLogOrmEntity maps notification aggregate history for auditing
 */
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "notification_logs" })
export class NotificationLogOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "channel", type: "varchar", length: 32 })
  channel!: string;

  @Column({ name: "template_key", type: "varchar", length: 120 })
  templateKey!: string;

  @Column({ name: "recipient", type: "jsonb" })
  recipient!: Record<string, unknown>;

  @Column({ name: "payload", type: "jsonb" })
  payload!: Record<string, unknown>;

  @Column({ name: "metadata", type: "jsonb", nullable: true })
  metadata!: Record<string, unknown> | null;

  @Column({ name: "status", type: "varchar", length: 20 })
  status!: string;

  @Column({ name: "attempts", type: "int", default: 0 })
  attempts!: number;

  @Column({ name: "scheduled_at", type: "timestamp", nullable: true })
  scheduledAt!: Date | null;

  @Column({ name: "last_attempt_at", type: "timestamp", nullable: true })
  lastAttemptAt!: Date | null;

  @Column({ name: "sent_at", type: "timestamp", nullable: true })
  sentAt!: Date | null;

  @Column({ name: "error_message", type: "text", nullable: true })
  errorMessage!: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
