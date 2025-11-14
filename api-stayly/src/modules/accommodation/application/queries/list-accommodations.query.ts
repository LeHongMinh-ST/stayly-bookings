/**
 * ListAccommodationsQuery
 * Query to list accommodations with filters and pagination
 */

import { PaginationQueryDto } from "../../../../common/application/dto/pagination-query.dto";
import { AccommodationType } from "../../domain/entities/accommodation.entity";

export class ListAccommodationsQuery extends PaginationQueryDto {
  constructor(
    public readonly ownerId?: string,
    public readonly type?: AccommodationType,
    public readonly status?: string,
    page?: number,
    limit?: number,
  ) {
    super(page, limit);
  }
}
