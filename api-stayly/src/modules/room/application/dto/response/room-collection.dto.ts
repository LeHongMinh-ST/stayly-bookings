/**
 * RoomCollectionDto
 * Paginated response DTO for homestay rooms list
 */

import { ApiProperty } from "@nestjs/swagger";
import { PaginatedResponseDto } from "../../../../../common/application/dto/paginated-response.dto";
import { RoomResponseDto } from "./room-response.dto";

export class RoomCollectionDto extends PaginatedResponseDto<RoomResponseDto> {
  @ApiProperty({
    description: "Array of homestay room items",
    type: () => RoomResponseDto,
    isArray: true,
  })
  declare data: RoomResponseDto[];

  constructor(
    data: RoomResponseDto[],
    total: number,
    perpage: number,
    current_page: number,
  ) {
    super(data, total, perpage, current_page);
  }
}
