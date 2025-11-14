/**
 * PaginationMetaDto
 * Common pagination metadata DTO
 */

import { ApiProperty } from "@nestjs/swagger";

export class PaginationMetaDto {
  @ApiProperty({
    description: "Total number of items",
    example: 100,
  })
  total!: number;

  @ApiProperty({
    description: "Number of items per page",
    example: 20,
  })
  perpage!: number;

  @ApiProperty({
    description: "Total number of pages",
    example: 5,
  })
  total_page!: number;

  @ApiProperty({
    description: "Current page number",
    example: 1,
  })
  current_page!: number;

  constructor(
    total: number,
    perpage: number,
    total_page: number,
    current_page: number,
  ) {
    this.total = total;
    this.perpage = perpage;
    this.total_page = total_page;
    this.current_page = current_page;
  }
}
