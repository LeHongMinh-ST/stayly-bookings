/**
 * RoleCollectionDto
 * Paginated response DTO for roles list
 * Uses common PaginatedResponseDto
 */

import { ApiProperty } from "@nestjs/swagger";
import { PaginatedResponseDto } from "../../../../../common/application/dto/paginated-response.dto";
import { RoleResponseDto } from "./role-response.dto";

export class RoleCollectionDto extends PaginatedResponseDto<RoleResponseDto> {
  @ApiProperty({
    description: "Array of role items",
    type: () => RoleResponseDto,
    isArray: true,
  })
  declare data: RoleResponseDto[];

  constructor(
    data: RoleResponseDto[],
    total: number,
    perpage: number,
    current_page: number,
  ) {
    super(data, total, perpage, current_page);
  }
}
