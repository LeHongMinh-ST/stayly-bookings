/**
 * HotelRoomCollectionDto
 * Paginated response DTO for physical hotel rooms list
 */

import { ApiProperty } from "@nestjs/swagger";
import { PaginatedResponseDto } from "../../../../../common/application/dto/paginated-response.dto";
import { HotelRoomResponseDto } from "./hotel-room-response.dto";

export class HotelRoomCollectionDto extends PaginatedResponseDto<HotelRoomResponseDto> {
  @ApiProperty({
    description: "Array of physical hotel room items",
    type: () => HotelRoomResponseDto,
    isArray: true,
  })
  declare data: HotelRoomResponseDto[];

  constructor(
    data: HotelRoomResponseDto[],
    total: number,
    perpage: number,
    current_page: number,
  ) {
    super(data, total, perpage, current_page);
  }
}
