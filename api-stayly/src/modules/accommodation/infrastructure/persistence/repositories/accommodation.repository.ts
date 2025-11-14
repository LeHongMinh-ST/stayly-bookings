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

  async findByOwnerId(ownerId: string): Promise<Accommodation[]> {
    const ormEntities = await this.accommodationRepo.find({
      where: { ownerId },
      order: { createdAt: "DESC" },
    });

    return ormEntities.map((entity) => this.mapper.toDomain(entity));
  }

  async findByType(type: AccommodationType): Promise<Accommodation[]> {
    const ormEntities = await this.accommodationRepo.find({
      where: { type },
      order: { createdAt: "DESC" },
    });

    return ormEntities.map((entity) => this.mapper.toDomain(entity));
  }

  async findAll(): Promise<Accommodation[]> {
    const ormEntities = await this.accommodationRepo.find({
      order: { createdAt: "DESC" },
    });

    return ormEntities.map((entity) => this.mapper.toDomain(entity));
  }

  async delete(id: AccommodationId): Promise<void> {
    await this.accommodationRepo.delete(id.getValue());
  }
}
