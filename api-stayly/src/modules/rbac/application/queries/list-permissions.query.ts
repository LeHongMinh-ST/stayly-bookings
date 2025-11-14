/**
 * ListPermissionsQuery retrieves all available permissions from catalog with pagination
 */
import { PaginationQueryDto } from "../../../../common/application/dto/pagination-query.dto";

export class ListPermissionsQuery extends PaginationQueryDto {
  constructor(
    public readonly search: string = "",
    page?: number,
    limit?: number,
  ) {
    super(page, limit);
  }
}
