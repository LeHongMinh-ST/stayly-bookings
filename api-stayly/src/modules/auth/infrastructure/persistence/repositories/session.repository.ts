/**
 * SessionRepository persists refresh token sessions with TypeORM
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { ISessionRepository } from '../../../domain/repositories/session.repository.interface';
import { Session } from '../../../domain/entities/session.entity';
import { SessionOrmEntity } from '../entities/session.orm-entity';
import { SessionOrmMapper } from '../mappers/session.mapper';

@Injectable()
export class SessionRepository implements ISessionRepository {
  constructor(
    @InjectRepository(SessionOrmEntity)
    private readonly sessionRepo: Repository<SessionOrmEntity>,
  ) {}

  async save(session: Session): Promise<void> {
    const existing = await this.sessionRepo.findOne({
      where: { id: session.getId() },
    });
    const entity = SessionOrmMapper.toOrm(session, existing ?? undefined);
    await this.sessionRepo.save(entity);
  }

  async findById(id: string): Promise<Session | null> {
    const entity = await this.sessionRepo.findOne({ where: { id } });
    return entity ? SessionOrmMapper.toDomain(entity) : null;
  }

  async findActiveByTokenId(tokenId: string): Promise<Session | null> {
    const now = new Date();
    const entity = await this.sessionRepo.findOne({
      where: {
        tokenId,
        refreshTokenExpiresAt: MoreThan(now),
        revokedAt: IsNull(),
      },
    });
    return entity ? SessionOrmMapper.toDomain(entity) : null;
  }

  async revokeById(id: string, revokedAt: Date): Promise<void> {
    await this.sessionRepo.update(
      { id },
      { revokedAt },
    );
  }
}
