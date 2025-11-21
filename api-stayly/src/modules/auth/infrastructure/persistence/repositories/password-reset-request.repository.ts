/**
 * PasswordResetRequestRepository implements persistence with TypeORM
 */
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";

import { PasswordResetRequest } from "../../../domain/entities/password-reset-request.entity";
import { IPasswordResetRequestRepository } from "../../../domain/repositories/password-reset-request.repository.interface";
import type {
  PasswordResetStatus,
  PasswordResetSubjectType,
} from "../../../domain/types/password-reset.types";
import { PasswordResetRequestOrmEntity } from "../entities/password-reset-request.orm-entity";
import { PasswordResetRequestOrmMapper } from "../mappers/password-reset-request.mapper";
import type { PasswordResetRequestId } from "../../../domain/value-objects/password-reset-request-id.vo";

@Injectable()
export class PasswordResetRequestRepository
  implements IPasswordResetRequestRepository
{
  constructor(
    @InjectRepository(PasswordResetRequestOrmEntity)
    private readonly repo: Repository<PasswordResetRequestOrmEntity>,
  ) {}

  /**
   * Persists aggregate using upsert semantics
   */
  async save(request: PasswordResetRequest): Promise<void> {
    const existing = await this.repo.findOne({
      where: { id: request.getId().getValue() },
    });
    const entity = PasswordResetRequestOrmMapper.toOrm(
      request,
      existing ?? undefined,
    );
    await this.repo.save(entity);
  }

  /**
   * Fetches request by identifier
   */
  async findById(
    id: PasswordResetRequestId,
  ): Promise<PasswordResetRequest | null> {
    const entity = await this.repo.findOne({
      where: { id: id.getValue() },
    });
    return entity ? PasswordResetRequestOrmMapper.toDomain(entity) : null;
  }

  /**
   * Finds request via hashed token for link-based resets
   */
  async findByTokenHash(
    tokenHash: string,
  ): Promise<PasswordResetRequest | null> {
    const entity = await this.repo.findOne({
      where: { tokenHash },
    });
    return entity ? PasswordResetRequestOrmMapper.toDomain(entity) : null;
  }

  /**
   * Finds latest request per subject filtered by statuses
   */
  async findLatestBySubject(
    subjectId: string,
    subjectType: PasswordResetSubjectType,
    statuses?: PasswordResetStatus[],
  ): Promise<PasswordResetRequest | null> {
    const where: Record<string, unknown> = {
      subjectId,
      subjectType,
    };
    if (statuses && statuses.length > 0) {
      Object.assign(where, { status: In(statuses) });
    }
    const entity = await this.repo.findOne({
      where,
      order: { createdAt: "DESC" },
    });
    return entity ? PasswordResetRequestOrmMapper.toDomain(entity) : null;
  }
}
