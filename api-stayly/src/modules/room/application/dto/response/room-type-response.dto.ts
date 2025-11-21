/**
 * RoomTypeResponseDto
 * Response DTO for hotel room type
 */

import { ApiProperty } from "@nestjs/swagger";
import { RoomStatus } from "../../../domain/value-objects/room-status.vo";
import { RoomTypeCategory } from "../../../domain/value-objects/room-type.vo";
import { BedType } from "../../../domain/value-objects/bed-type.vo";

export class RoomTypeResponseDto {
  @ApiProperty({ description: "Room type ID" })
  id: string;

  @ApiProperty({ description: "Hotel ID" })
  hotelId: string;

  @ApiProperty({ description: "Room type name" })
  name: string;

  @ApiProperty({ description: "Room category", enum: RoomTypeCategory })
  category: RoomTypeCategory;

  @ApiProperty({ description: "Room area in square meters" })
  area: number;

  @ApiProperty({ description: "Bed count" })
  bedCount: number;

  @ApiProperty({ description: "Bed type", enum: BedType })
  bedType: BedType;

  @ApiProperty({ description: "Guest capacity" })
  capacity: {
    maxAdults: number;
    maxChildren: number;
    total: number;
  };

  @ApiProperty({ description: "Room type status", enum: RoomStatus })
  status: RoomStatus;

  @ApiProperty({ description: "Amenities list", type: [String] })
  amenities: string[];

  @ApiProperty({ description: "Room images" })
  images: Array<{
    url: string;
    type: string;
    order: number;
  }>;

  @ApiProperty({ description: "Inventory count" })
  inventory: number;

  @ApiProperty({ description: "Base price" })
  basePrice: {
    amount: number;
    currency: string;
  };

  @ApiProperty({
    description: "View direction (optional)",
    required: false,
  })
  viewDirection?: string;
}
