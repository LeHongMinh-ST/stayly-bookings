/**
 * ListHomestayRoomsQuery
 * Query to list homestay rooms with filters and pagination
 */

import { PaginationQueryDto } from "../../../../common/application/dto/pagination-query.dto";
import { RoomStatus } from "../../domain/value-objects/room-status.vo";

export class ListHomestayRoomsQuery extends PaginationQueryDto {
  constructor(
    public readonly accommodationId?: string,
    public readonly status?: RoomStatus,
    page?: number,
    limit?: number,
  ) {
    super(page, limit);
  }
}
