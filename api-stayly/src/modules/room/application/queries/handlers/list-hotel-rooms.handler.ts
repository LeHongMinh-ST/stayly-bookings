/**
 * ListHotelRoomsHandler
 * Handles ListHotelRoomsQuery
 */

import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { ListHotelRoomsQuery } from "../list-hotel-rooms.query";
import { ROOM_TYPE_REPOSITORY } from "../../../domain/repositories/room-type.repository.interface";
import type { IRoomTypeRepository } from "../../../domain/repositories/room-type.repository.interface";
import { HotelRoomCollectionDto } from "../../dto/response/hotel-room-collection.dto";
import { HotelRoomResponseDto } from "../../dto/response/hotel-room-response.dto";
import { RoomDtoMapper } from "../../../infrastructure/persistence/mappers/room-dto.mapper";

@QueryHandler(ListHotelRoomsQuery)
export class ListHotelRoomsHandler
  implements IQueryHandler<ListHotelRoomsQuery, HotelRoomCollectionDto>
{
  constructor(
    @Inject(ROOM_TYPE_REPOSITORY)
    private readonly roomTypeRepository: IRoomTypeRepository,
    private readonly dtoMapper: RoomDtoMapper,
  ) {}

  async execute(query: ListHotelRoomsQuery): Promise<HotelRoomCollectionDto> {
    // Validate and normalize pagination params
    const { page, limit, offset } = query.normalize();

    // Build filters
    const filters = {
      roomTypeId: query.roomTypeId,
      floorId: query.floorId,
      status: query.status,
    };

    // Fetch hotel rooms and total count in parallel
    const [hotelRooms, total] = await Promise.all([
      this.roomTypeRepository.findManyHotelRooms(limit, offset, filters),
      this.roomTypeRepository.countHotelRooms(filters),
    ]);

    // Map to DTOs
    const data: HotelRoomResponseDto[] = hotelRooms.map((hotelRoom) =>
      this.dtoMapper.toHotelRoomDto(hotelRoom),
    );

    return new HotelRoomCollectionDto(data, total, limit, page);
  }
}
