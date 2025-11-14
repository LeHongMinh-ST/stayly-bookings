/**
 * AccommodationCollectionDto
 * Paginated response DTO for accommodations list
 * Uses common PaginatedResponseDto
 */

import { ApiProperty } from "@nestjs/swagger";
import { PaginatedResponseDto } from "../../../../../common/application/dto/paginated-response.dto";
import { AccommodationResponseDto } from "./accommodation-response.dto";

export class AccommodationCollectionDto extends PaginatedResponseDto<AccommodationResponseDto> {
  @ApiProperty({
    description: "Array of accommodation items",
    type: () => AccommodationResponseDto,
    isArray: true,
  })
  declare data: AccommodationResponseDto[];

  constructor(
    data: AccommodationResponseDto[],
    total: number,
    perpage: number,
    current_page: number,
  ) {
    super(data, total, perpage, current_page);
  }
}
