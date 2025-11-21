/**
 * ListHotelRoomsQuery
 * Query to list physical hotel rooms with filters and pagination
 */

import { PaginationQueryDto } from "../../../../common/application/dto/pagination-query.dto";
import { HotelRoomStatus } from "../../domain/value-objects/hotel-room-status.vo";

export class ListHotelRoomsQuery extends PaginationQueryDto {
  constructor(
    public readonly roomTypeId?: string,
    public readonly floorId?: string,
    public readonly status?: HotelRoomStatus,
    page?: number,
    limit?: number,
  ) {
    super(page, limit);
  }
}
