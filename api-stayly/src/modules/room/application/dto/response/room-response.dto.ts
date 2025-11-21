/**
 * RoomResponseDto
 * Response DTO for homestay room
 */

import { ApiProperty } from "@nestjs/swagger";
import { RoomStatus } from "../../../domain/value-objects/room-status.vo";
import { RoomTypeCategory } from "../../../domain/value-objects/room-type.vo";
import { BedType } from "../../../domain/value-objects/bed-type.vo";

export class RoomResponseDto {
  @ApiProperty({ description: "Room ID" })
  id: string;

  @ApiProperty({ description: "Accommodation ID (homestay)" })
  accommodationId: string;

  @ApiProperty({ description: "Room name" })
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
  guestCapacity: {
    maxAdults: number;
    maxChildren: number;
    total: number;
  };

  @ApiProperty({ description: "Room status", enum: RoomStatus })
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

  @ApiProperty({ description: "Base price (optional)", required: false })
  basePrice?: {
    amount: number;
    currency: string;
  };
}
