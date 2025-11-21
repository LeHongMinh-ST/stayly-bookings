/**
 * ListRoomTypesHandler
 * Handles ListRoomTypesQuery
 */

import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { ListRoomTypesQuery } from "../list-room-types.query";
import { ROOM_TYPE_REPOSITORY } from "../../../domain/repositories/room-type.repository.interface";
import type { IRoomTypeRepository } from "../../../domain/repositories/room-type.repository.interface";
import { RoomTypeCollectionDto } from "../../dto/response/room-type-collection.dto";
import { RoomTypeResponseDto } from "../../dto/response/room-type-response.dto";
import { RoomDtoMapper } from "../../../infrastructure/persistence/mappers/room-dto.mapper";

@QueryHandler(ListRoomTypesQuery)
export class ListRoomTypesHandler
  implements IQueryHandler<ListRoomTypesQuery, RoomTypeCollectionDto>
{
  constructor(
    @Inject(ROOM_TYPE_REPOSITORY)
    private readonly roomTypeRepository: IRoomTypeRepository,
    private readonly dtoMapper: RoomDtoMapper,
  ) {}

  async execute(query: ListRoomTypesQuery): Promise<RoomTypeCollectionDto> {
    // Validate and normalize pagination params
    const { page, limit, offset } = query.normalize();

    // Build filters
    const filters = {
      hotelId: query.hotelId,
      status: query.status,
    };

    // Fetch room types and total count in parallel
    const [roomTypes, total] = await Promise.all([
      this.roomTypeRepository.findMany(limit, offset, filters),
      this.roomTypeRepository.count(filters),
    ]);

    // Map to DTOs
    const data: RoomTypeResponseDto[] = roomTypes.map((roomType) =>
      this.dtoMapper.toRoomTypeDto(roomType),
    );

    return new RoomTypeCollectionDto(data, total, limit, page);
  }
}
