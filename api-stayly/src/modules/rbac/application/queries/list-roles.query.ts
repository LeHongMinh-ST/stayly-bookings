/**
 * ListRolesQuery retrieves all available roles from catalog with pagination
 */
import { PaginationQueryDto } from "../../../../common/application/dto/pagination-query.dto";

export class ListRolesQuery extends PaginationQueryDto {
  constructor(page?: number, limit?: number) {
    super(page, limit);
  }
}
