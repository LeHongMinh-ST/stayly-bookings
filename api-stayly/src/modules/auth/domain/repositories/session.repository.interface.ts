/**
 * ISessionRepository persists refresh token sessions for authentication flow
 */
import { Session } from '../entities/session.entity';

export interface ISessionRepository {
  save(session: Session): Promise<void>;
  findById(id: string): Promise<Session | null>;
  findActiveByTokenId(tokenId: string): Promise<Session | null>;
  revokeById(id: string, revokedAt: Date): Promise<void>;
}

export const SESSION_REPOSITORY = 'SESSION_REPOSITORY';
