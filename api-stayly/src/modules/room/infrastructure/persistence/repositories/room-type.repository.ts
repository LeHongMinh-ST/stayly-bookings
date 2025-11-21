import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { IRoomTypeRepository } from "../../../domain/repositories/room-type.repository.interface";
import { RoomType } from "../../../domain/entities/room-type.entity";
import { RoomTypeId } from "../../../domain/value-objects/room-type-id.vo";
import { HotelRoom } from "../../../domain/entities/hotel-room.entity";
import { HotelRoomId } from "../../../domain/value-objects/hotel-room-id.vo";
import { Room } from "../../../domain/entities/room.entity";
import { RoomTypeOrmEntity } from "../entities/room-type.orm-entity";
import { HotelRoomOrmEntity } from "../entities/hotel-room.orm-entity";
import { RoomTypeOrmMapper } from "../mappers/room-type-orm.mapper";
import { RoomOrmEntity } from "../entities/room.orm-entity";
import { RoomOrmMapper } from "../mappers/room-orm.mapper";

@Injectable()
export class RoomTypeRepository implements IRoomTypeRepository {
  constructor(
    @InjectRepository(RoomTypeOrmEntity)
    private readonly roomTypeRepo: Repository<RoomTypeOrmEntity>,
    @InjectRepository(HotelRoomOrmEntity)
    private readonly hotelRoomRepo: Repository<HotelRoomOrmEntity>,
    @InjectRepository(RoomOrmEntity)
    private readonly roomRepo: Repository<RoomOrmEntity>,
  ) {}

  async save(roomType: RoomType): Promise<void> {
    await this.roomTypeRepo.save(RoomTypeOrmMapper.toOrm(roomType));
  }

  async findById(id: RoomTypeId): Promise<RoomType | null> {
    const entity = await this.roomTypeRepo.findOne({
      where: { id: id.getValue() },
      relations: ["rooms"],
    });

    if (!entity) {
      return null;
    }

    return RoomTypeOrmMapper.toDomain(entity, entity.rooms || []);
  }

  async findByHotelId(hotelId: string): Promise<RoomType[]> {
    const entities = await this.roomTypeRepo.find({
      where: { hotelId },
      relations: ["rooms"],
      order: { createdAt: "DESC" },
    });

    return entities.map((entity) =>
      RoomTypeOrmMapper.toDomain(entity, entity.rooms || []),
    );
  }

  async lockById(id: RoomTypeId): Promise<RoomType | null> {
    const entity = await this.roomTypeRepo.findOne({
      where: { id: id.getValue() },
      relations: ["rooms"],
      lock: { mode: "pessimistic_write" },
    });

    if (!entity) {
      return null;
    }

    return RoomTypeOrmMapper.toDomain(entity, entity.rooms || []);
  }

  async saveHotelRoom(room: HotelRoom): Promise<void> {
    await this.hotelRoomRepo.save(RoomTypeOrmMapper.hotelRoomToOrm(room));
  }

  async findHotelRoomById(id: HotelRoomId): Promise<HotelRoom | null> {
    const entity = await this.hotelRoomRepo.findOne({
      where: { id: id.getValue() },
    });

    return entity ? RoomTypeOrmMapper.hotelRoomToDomain(entity) : null;
  }

  async findHotelRoomsByType(roomTypeId: RoomTypeId): Promise<HotelRoom[]> {
    const entities = await this.hotelRoomRepo.find({
      where: { roomTypeId: roomTypeId.getValue() },
      order: { roomNumber: "ASC" },
    });

    return entities.map((entity) =>
      RoomTypeOrmMapper.hotelRoomToDomain(entity),
    );
  }

  async lockHotelRoomById(id: HotelRoomId): Promise<HotelRoom | null> {
    const entity = await this.hotelRoomRepo.findOne({
      where: { id: id.getValue() },
      lock: { mode: "pessimistic_write" },
    });

    return entity ? RoomTypeOrmMapper.hotelRoomToDomain(entity) : null;
  }

  async findRoomOverviewForAccommodation(
    accommodationId: string,
  ): Promise<Room[]> {
    const entities = await this.roomRepo.find({
      where: { accommodationId },
      order: { createdAt: "DESC" },
    });

    return entities.map((entity) => RoomOrmMapper.toDomain(entity));
  }
}
