/**
 * Room Management Module
 * Provides room management capabilities for homestay and hotel
 */

import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RoomsController } from "./presentation/controllers/rooms.controller";
import { CreateRoomHandler } from "./application/commands/handlers/create-room.handler";
import { CreateRoomTypeHandler } from "./application/commands/handlers/create-room-type.handler";
import { CreateHotelRoomHandler } from "./application/commands/handlers/create-hotel-room.handler";
import { ROOM_REPOSITORY } from "./domain/repositories/room.repository.interface";
import { RoomRepository } from "./infrastructure/persistence/repositories/room.repository";
import { ROOM_TYPE_REPOSITORY } from "./domain/repositories/room-type.repository.interface";
import { RoomTypeRepository } from "./infrastructure/persistence/repositories/room-type.repository";
import { RoomOrmEntity } from "./infrastructure/persistence/entities/room.orm-entity";
import { RoomTypeOrmEntity } from "./infrastructure/persistence/entities/room-type.orm-entity";
import { HotelRoomOrmEntity } from "./infrastructure/persistence/entities/hotel-room.orm-entity";
import { RoomOrmMapper } from "./infrastructure/persistence/mappers/room-orm.mapper";
import { RoomTypeOrmMapper } from "./infrastructure/persistence/mappers/room-type-orm.mapper";
import { RoomDtoMapper } from "./infrastructure/persistence/mappers/room-dto.mapper";
import { RoomAvailabilityService } from "./domain/services/room-availability.service";
import { RoomFactoryService } from "./domain/services/room-factory.service";

import { ListHomestayRoomsHandler } from "./application/queries/handlers/list-homestay-rooms.handler";
import { ListRoomTypesHandler } from "./application/queries/handlers/list-room-types.handler";
import { ListHotelRoomsHandler } from "./application/queries/handlers/list-hotel-rooms.handler";

const commandHandlers = [
  CreateRoomHandler,
  CreateRoomTypeHandler,
  CreateHotelRoomHandler,
];

const queryHandlers = [
  ListHomestayRoomsHandler,
  ListRoomTypesHandler,
  ListHotelRoomsHandler,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      RoomOrmEntity,
      RoomTypeOrmEntity,
      HotelRoomOrmEntity,
    ]),
  ],
  controllers: [RoomsController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    { provide: ROOM_REPOSITORY, useClass: RoomRepository },
    { provide: ROOM_TYPE_REPOSITORY, useClass: RoomTypeRepository },
    RoomOrmMapper,
    RoomTypeOrmMapper,
    RoomDtoMapper,
    RoomAvailabilityService,
    RoomFactoryService,
  ],
  exports: [ROOM_REPOSITORY, ROOM_TYPE_REPOSITORY],
})
export class RoomModule {}
