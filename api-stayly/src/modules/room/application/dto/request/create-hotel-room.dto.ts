/**
 * CreateHotelRoomDto
 * Request DTO for creating a physical hotel room
 */

import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, MaxLength } from "class-validator";

export class CreateHotelRoomDto {
  @ApiProperty({ description: "Room type ID" })
  @IsString()
  @IsNotEmpty()
  roomTypeId: string;

  @ApiProperty({ description: "Room number", maxLength: 32 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  roomNumber: string;

  @ApiProperty({
    description: "Floor ID (optional)",
    required: false,
  })
  @IsOptional()
  @IsString()
  floorId?: string;

  @ApiProperty({
    description: "Notes (optional)",
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
