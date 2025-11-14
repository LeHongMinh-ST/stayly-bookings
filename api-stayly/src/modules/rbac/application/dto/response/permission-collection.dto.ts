/**
 * PermissionCollectionDto
 * Paginated response DTO for permissions list
 * Uses common PaginatedResponseDto
 */

import { ApiProperty } from "@nestjs/swagger";
import { PaginatedResponseDto } from "../../../../../common/application/dto/paginated-response.dto";
import { PermissionResponseDto } from "./permission-response.dto";

export class PermissionCollectionDto extends PaginatedResponseDto<PermissionResponseDto> {
  @ApiProperty({
    description: "Array of permission items",
    type: () => PermissionResponseDto,
    isArray: true,
  })
  declare data: PermissionResponseDto[];

  constructor(
    data: PermissionResponseDto[],
    total: number,
    perpage: number,
    current_page: number,
  ) {
    super(data, total, perpage, current_page);
  }
}
