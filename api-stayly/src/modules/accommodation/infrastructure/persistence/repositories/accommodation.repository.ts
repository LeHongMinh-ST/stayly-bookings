/**
 * AccommodationRepository
 * Implementation of IAccommodationRepository using TypeORM
 */

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { IAccommodationRepository } from "../../../domain/repositories/accommodation.repository.interface";
import { Accommodation } from "../../../domain/entities/accommodation.entity";
import { AccommodationId } from "../../../domain/value-objects/accommodation-id.vo";
import { AccommodationType } from "../../../domain/entities/accommodation.entity";
import { AccommodationOrmEntity } from "../entities/accommodation.orm-entity";
import { AccommodationMapper } from "../mappers/accommodation.mapper";

@Injectable()
export class AccommodationRepository implements IAccommodationRepository {
  constructor(
    @InjectRepository(AccommodationOrmEntity)
    private readonly accommodationRepo: Repository<AccommodationOrmEntity>,
    private readonly mapper: AccommodationMapper,
  ) {}

  async save(accommodation: Accommodation): Promise<void> {
    const ormEntity = this.mapper.toOrmEntity(accommodation);
    await this.accommodationRepo.save(ormEntity);
  }

  async findById(id: AccommodationId): Promise<Accommodation | null> {
    const ormEntity = await this.accommodationRepo.findOne({
      where: { id: id.getValue() },
    });

    if (!ormEntity) {
      return null;
    }

    return this.mapper.toDomain(ormEntity);
  }

  async findByOwnerId(
    ownerId: string,
    limit?: number,
    offset?: number,
    status?: string,
  ): Promise<Accommodation[]> {
    const queryBuilder = this.accommodationRepo
      .createQueryBuilder("accommodation")
      .where("accommodation.ownerId = :ownerId", { ownerId })
      .orderBy("accommodation.createdAt", "DESC");

    if (status) {
      queryBuilder.andWhere("accommodation.status = :status", { status });
    }

    if (limit !== undefined) {
      queryBuilder.take(limit);
    }
    if (offset !== undefined) {
      queryBuilder.skip(offset);
    }

    const ormEntities = await queryBuilder.getMany();
    return ormEntities.map((entity) => this.mapper.toDomain(entity));
  }

  async findByType(
    type: AccommodationType,
    limit?: number,
    offset?: number,
    status?: string,
  ): Promise<Accommodation[]> {
    const queryBuilder = this.accommodationRepo
      .createQueryBuilder("accommodation")
      .where("accommodation.type = :type", { type })
      .orderBy("accommodation.createdAt", "DESC");

    if (status) {
      queryBuilder.andWhere("accommodation.status = :status", { status });
    }

    if (limit !== undefined) {
      queryBuilder.take(limit);
    }
    if (offset !== undefined) {
      queryBuilder.skip(offset);
    }

    const ormEntities = await queryBuilder.getMany();
    return ormEntities.map((entity) => this.mapper.toDomain(entity));
  }

  async findAll(
    limit?: number,
    offset?: number,
    status?: string,
  ): Promise<Accommodation[]> {
    const queryBuilder = this.accommodationRepo
      .createQueryBuilder("accommodation")
      .orderBy("accommodation.createdAt", "DESC");

    if (status) {
      queryBuilder.where("accommodation.status = :status", { status });
    }

    if (limit !== undefined) {
      queryBuilder.take(limit);
    }
    if (offset !== undefined) {
      queryBuilder.skip(offset);
    }

    const ormEntities = await queryBuilder.getMany();
    return ormEntities.map((entity) => this.mapper.toDomain(entity));
  }

  async count(filters?: {
    ownerId?: string;
    type?: AccommodationType;
    status?: string;
  }): Promise<number> {
    const queryBuilder =
      this.accommodationRepo.createQueryBuilder("accommodation");

    if (filters?.ownerId) {
      queryBuilder.where("accommodation.ownerId = :ownerId", {
        ownerId: filters.ownerId,
      });
    }

    if (filters?.type) {
      if (filters.ownerId) {
        queryBuilder.andWhere("accommodation.type = :type", {
          type: filters.type,
        });
      } else {
        queryBuilder.where("accommodation.type = :type", {
          type: filters.type,
        });
      }
    }

    if (filters?.status) {
      const whereClause =
        filters.ownerId || filters.type ? "andWhere" : "where";
      queryBuilder[whereClause]("accommodation.status = :status", {
        status: filters.status,
      });
    }

    return queryBuilder.getCount();
  }

  async delete(id: AccommodationId): Promise<void> {
    await this.accommodationRepo.delete(id.getValue());
  }
}
