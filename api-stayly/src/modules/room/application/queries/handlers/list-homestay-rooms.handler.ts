/**
 * ListHomestayRoomsHandler
 * Handles ListHomestayRoomsQuery
 */

import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { ListHomestayRoomsQuery } from "../list-homestay-rooms.query";
import { ROOM_REPOSITORY } from "../../../domain/repositories/room.repository.interface";
import type { IRoomRepository } from "../../../domain/repositories/room.repository.interface";
import { RoomCollectionDto } from "../../dto/response/room-collection.dto";
import { RoomResponseDto } from "../../dto/response/room-response.dto";
import { RoomDtoMapper } from "../../../infrastructure/persistence/mappers/room-dto.mapper";

@QueryHandler(ListHomestayRoomsQuery)
export class ListHomestayRoomsHandler
  implements IQueryHandler<ListHomestayRoomsQuery, RoomCollectionDto>
{
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    private readonly dtoMapper: RoomDtoMapper,
  ) {}

  async execute(query: ListHomestayRoomsQuery): Promise<RoomCollectionDto> {
    // Validate and normalize pagination params
    const { page, limit, offset } = query.normalize();

    // Build filters
    const filters = {
      accommodationId: query.accommodationId,
      status: query.status,
    };

    // Fetch rooms and total count in parallel
    const [rooms, total] = await Promise.all([
      this.roomRepository.findMany(limit, offset, filters),
      this.roomRepository.count(filters),
    ]);

    // Map to DTOs
    const data: RoomResponseDto[] = rooms.map((room) =>
      this.dtoMapper.toRoomDto(room),
    );

    return new RoomCollectionDto(data, total, limit, page);
  }
}
