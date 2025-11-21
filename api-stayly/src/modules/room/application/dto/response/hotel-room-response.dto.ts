/**
 * HotelRoomResponseDto
 * Response DTO for physical hotel room
 */

import { ApiProperty } from "@nestjs/swagger";
import { HotelRoomStatus } from "../../../domain/value-objects/hotel-room-status.vo";

export class HotelRoomResponseDto {
  @ApiProperty({ description: "Hotel room ID" })
  id: string;

  @ApiProperty({ description: "Room type ID" })
  roomTypeId: string;

  @ApiProperty({ description: "Room number" })
  roomNumber: string;

  @ApiProperty({ description: "Floor ID (optional)", required: false })
  floorId?: string;

  @ApiProperty({ description: "Room status", enum: HotelRoomStatus })
  status: HotelRoomStatus;

  @ApiProperty({ description: "Notes (optional)", required: false })
  notes?: string;
}
