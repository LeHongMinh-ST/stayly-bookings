import { PaginationQueryDto } from "../../../../common/application/dto/pagination-query.dto";

/**
 * ListUsersQuery supports pagination and filtering for administrative users
 */
export class ListUsersQuery extends PaginationQueryDto {
  constructor(page?: number, limit?: number) {
    super(page, limit);
  }
}
