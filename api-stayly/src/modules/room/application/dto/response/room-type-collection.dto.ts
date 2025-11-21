/**
 * RoomTypeCollectionDto
 * Paginated response DTO for hotel room types list
 */

import { ApiProperty } from "@nestjs/swagger";
import { PaginatedResponseDto } from "../../../../../common/application/dto/paginated-response.dto";
import { RoomTypeResponseDto } from "./room-type-response.dto";

export class RoomTypeCollectionDto extends PaginatedResponseDto<RoomTypeResponseDto> {
  @ApiProperty({
    description: "Array of hotel room type items",
    type: () => RoomTypeResponseDto,
    isArray: true,
  })
  declare data: RoomTypeResponseDto[];

  constructor(
    data: RoomTypeResponseDto[],
    total: number,
    perpage: number,
    current_page: number,
  ) {
    super(data, total, perpage, current_page);
  }
}
