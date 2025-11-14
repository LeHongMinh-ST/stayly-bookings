/**
 * PaginatedResponseDto
 * Generic paginated response DTO that can be used by all modules
 */

import { ApiProperty } from "@nestjs/swagger";
import { PaginationMetaDto } from "./pagination-meta.dto";

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: "Array of items",
    isArray: true,
  })
  data!: T[];

  @ApiProperty({
    description: "Pagination metadata",
    type: PaginationMetaDto,
  })
  meta!: PaginationMetaDto;

  constructor(data: T[], total: number, perpage: number, current_page: number) {
    this.data = data;
    const total_page = Math.ceil(total / perpage);
    this.meta = new PaginationMetaDto(total, perpage, total_page, current_page);
  }
}
