/**
 * SessionOrmEntity stores refresh token sessions per user
 */
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'auth_sessions' })
export class SessionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_session_user_id')
  @Column({ name: 'user_id' })
  userId!: string;

  @Index('idx_session_token_id', { unique: true })
  @Column({ name: 'token_id', unique: true })
  tokenId!: string;

  @Column({ name: 'refresh_token', type: 'text' })
  refreshToken!: string;

  @Column({ name: 'refresh_token_expires_at', type: 'timestamp' })
  refreshTokenExpiresAt!: Date;

  @Column({ name: 'user_agent', nullable: true, type: 'text' })
  userAgent!: string | null;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress!: string | null;

  @Column({ name: 'revoked_at', type: 'timestamp', nullable: true })
  revokedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
