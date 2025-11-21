import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { IRoomRepository } from "../../../domain/repositories/room.repository.interface";
import { Room } from "../../../domain/entities/room.entity";
import { RoomId } from "../../../domain/value-objects/room-id.vo";
import { RoomOrmEntity } from "../entities/room.orm-entity";
import { RoomOrmMapper } from "../mappers/room-orm.mapper";

@Injectable()
export class RoomRepository implements IRoomRepository {
  constructor(
    @InjectRepository(RoomOrmEntity)
    private readonly roomRepo: Repository<RoomOrmEntity>,
  ) {}

  async save(room: Room): Promise<void> {
    await this.roomRepo.save(RoomOrmMapper.toOrm(room));
  }

  async findById(id: RoomId): Promise<Room | null> {
    const entity = await this.roomRepo.findOne({
      where: { id: id.getValue() },
    });

    return entity ? RoomOrmMapper.toDomain(entity) : null;
  }

  async findByAccommodationId(accommodationId: string): Promise<Room[]> {
    const entities = await this.roomRepo.find({
      where: { accommodationId },
      order: { createdAt: "DESC" },
    });
    return entities.map((entity) => RoomOrmMapper.toDomain(entity));
  }

  async lockById(id: RoomId): Promise<Room | null> {
    const entity = await this.roomRepo.findOne({
      where: { id: id.getValue() },
      lock: { mode: "pessimistic_write" },
    });
    return entity ? RoomOrmMapper.toDomain(entity) : null;
  }

  async findMany(
    limit: number,
    offset: number,
    filters?: {
      accommodationId?: string;
      status?: string;
    },
  ): Promise<Room[]> {
    const queryBuilder = this.roomRepo.createQueryBuilder("room");

    if (filters?.accommodationId) {
      queryBuilder.andWhere("room.accommodationId = :accommodationId", {
        accommodationId: filters.accommodationId,
      });
    }

    if (filters?.status) {
      queryBuilder.andWhere("room.status = :status", {
        status: filters.status,
      });
    }

    queryBuilder.orderBy("room.createdAt", "DESC").take(limit).skip(offset);

    const entities = await queryBuilder.getMany();
    return entities.map((entity) => RoomOrmMapper.toDomain(entity));
  }

  async count(filters?: {
    accommodationId?: string;
    status?: string;
  }): Promise<number> {
    const queryBuilder = this.roomRepo.createQueryBuilder("room");

    if (filters?.accommodationId) {
      queryBuilder.andWhere("room.accommodationId = :accommodationId", {
        accommodationId: filters.accommodationId,
      });
    }

    if (filters?.status) {
      queryBuilder.andWhere("room.status = :status", {
        status: filters.status,
      });
    }

    return queryBuilder.getCount();
  }
}
