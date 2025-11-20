/**
 * UpdateAccommodationDto
 * DTO for updating an accommodation
 */

import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsBoolean,
  ValidateNested,
  Min,
  Max,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

class AddressDto {
  @ApiProperty({ example: "123 Main St" })
  @IsString()
  street: string;

  @ApiProperty({ example: "Ward 1" })
  @IsString()
  ward: string;

  @ApiProperty({ example: "District 1" })
  @IsString()
  district: string;

  @ApiProperty({ example: "Ho Chi Minh City" })
  @IsString()
  province: string;

  @ApiProperty({ example: "Vietnam" })
  @IsString()
  country: string;
}

class LocationDto {
  @ApiProperty({ example: 10.762622 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 106.660172 })
  @IsNumber()
  longitude: number;
}

class PoliciesDto {
  @ApiProperty({ example: "14:00" })
  @IsString()
  checkInTime: string;

  @ApiProperty({ example: "12:00" })
  @IsString()
  checkOutTime: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  childrenAllowed: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  petsAllowed: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  smokingAllowed: boolean;
}

class CancellationPolicyDto {
  @ApiProperty({ example: "flexible" })
  @IsString()
  type: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  freeCancellationDays: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  refundPercentage: number;
}

export class UpdateAccommodationDto {
  @ApiPropertyOptional({ example: "Luxury Apartment in D1" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: "A beautiful apartment..." })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: ["https://example.com/image1.jpg"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ example: ["wifi", "pool", "gym"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @ApiPropertyOptional({ type: PoliciesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PoliciesDto)
  policies?: PoliciesDto;

  @ApiPropertyOptional({ type: CancellationPolicyDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CancellationPolicyDto)
  cancellationPolicy?: CancellationPolicyDto;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  starRating?: number;

  @ApiPropertyOptional({ type: AddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiPropertyOptional({ type: LocationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;
}
