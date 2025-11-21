/**
 * CreateRoomTypeDto
 * Request DTO for creating a hotel room type
 */

import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsEnum,
  IsOptional,
  ValidateNested,
  Min,
  ArrayMinSize,
} from "class-validator";
import { Type } from "class-transformer";
import { RoomTypeCategory } from "../../../domain/value-objects/room-type.vo";
import { BedType } from "../../../domain/value-objects/bed-type.vo";
import { RoomImageType } from "../../../domain/value-objects/room-image.vo";

class GuestCapacityDto {
  @ApiProperty({ description: "Maximum adults", minimum: 1 })
  @IsNumber()
  @Min(1)
  maxAdults: number;

  @ApiProperty({
    description: "Maximum children",
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxChildren?: number;
}

class RoomImageDto {
  @ApiProperty({ description: "Image URL" })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    description: "Image type",
    enum: RoomImageType,
    required: false,
  })
  @IsOptional()
  @IsEnum(RoomImageType)
  type?: RoomImageType;

  @ApiProperty({ description: "Display order", required: false, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}

class BasePriceDto {
  @ApiProperty({ description: "Price amount", minimum: 0 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ description: "Currency code (ISO-4217)", example: "VND" })
  @IsString()
  @IsNotEmpty()
  currency: string;
}

export class CreateRoomTypeDto {
  @ApiProperty({ description: "Hotel ID" })
  @IsString()
  @IsNotEmpty()
  hotelId: string;

  @ApiProperty({ description: "Room type name" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: "Room category", enum: RoomTypeCategory })
  @IsEnum(RoomTypeCategory)
  category: RoomTypeCategory;

  @ApiProperty({ description: "Room area in square meters", minimum: 1 })
  @IsNumber()
  @Min(1)
  area: number;

  @ApiProperty({ description: "Guest capacity" })
  @ValidateNested()
  @Type(() => GuestCapacityDto)
  capacity: GuestCapacityDto;

  @ApiProperty({ description: "Bed count", minimum: 1 })
  @IsNumber()
  @Min(1)
  bedCount: number;

  @ApiProperty({ description: "Bed type", enum: BedType })
  @IsEnum(BedType)
  bedType: BedType;

  @ApiProperty({ description: "Room description" })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: "Amenities list", type: [String] })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  amenities: string[];

  @ApiProperty({
    description: "Room images (minimum 3 images required for hotel room type)",
    type: [RoomImageDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoomImageDto)
  @ArrayMinSize(3)
  images: RoomImageDto[];

  @ApiProperty({ description: "Inventory count", minimum: 1 })
  @IsNumber()
  @Min(1)
  inventory: number;

  @ApiProperty({ description: "Base price" })
  @ValidateNested()
  @Type(() => BasePriceDto)
  basePrice: BasePriceDto;

  @ApiProperty({
    description: "View direction (optional)",
    required: false,
  })
  @IsOptional()
  @IsString()
  viewDirection?: string;
}
