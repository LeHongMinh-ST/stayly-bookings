/**
 * ListRoomTypesQuery
 * Query to list hotel room types with filters and pagination
 */

import { PaginationQueryDto } from "../../../../common/application/dto/pagination-query.dto";
import { RoomStatus } from "../../domain/value-objects/room-status.vo";

export class ListRoomTypesQuery extends PaginationQueryDto {
  constructor(
    public readonly hotelId?: string,
    public readonly status?: RoomStatus,
    page?: number,
    limit?: number,
  ) {
    super(page, limit);
  }
}
