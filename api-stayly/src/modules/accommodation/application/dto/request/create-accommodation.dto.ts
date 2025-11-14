/**
 * CreateAccommodationDto
 * Request DTO for creating accommodation
 */

import { ApiProperty } from "@nestjs/swagger";
import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from "class-validator";
import { Type } from "class-transformer";
import { AccommodationType } from "../../../domain/entities/accommodation.entity";
import { CancellationPolicyType } from "../../../domain/value-objects/cancellation-policy.vo";

class AddressDto {
  @ApiProperty({ description: "Street address" })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({ description: "Ward" })
  @IsString()
  @IsNotEmpty()
  ward: string;

  @ApiProperty({ description: "District" })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty({ description: "Province" })
  @IsString()
  @IsNotEmpty()
  province: string;

  @ApiProperty({ description: "Country" })
  @IsString()
  @IsNotEmpty()
  country: string;
}

class LocationDto {
  @ApiProperty({ description: "Latitude", example: 10.762622 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ description: "Longitude", example: 106.660172 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}

class PoliciesDto {
  @ApiProperty({ description: "Check-in time", example: "14:00" })
  @IsString()
  @IsNotEmpty()
  checkInTime: string;

  @ApiProperty({ description: "Check-out time", example: "12:00" })
  @IsString()
  @IsNotEmpty()
  checkOutTime: string;

  @ApiProperty({ description: "Children allowed" })
  @IsBoolean()
  childrenAllowed: boolean;

  @ApiProperty({ description: "Pets allowed" })
  @IsBoolean()
  petsAllowed: boolean;

  @ApiProperty({ description: "Smoking allowed" })
  @IsBoolean()
  smokingAllowed: boolean;
}

class CancellationPolicyDto {
  @ApiProperty({
    description: "Cancellation policy type",
    enum: CancellationPolicyType,
  })
  @IsEnum(CancellationPolicyType)
  type: CancellationPolicyType;

  @ApiProperty({ description: "Free cancellation days" })
  @IsNumber()
  @Min(0)
  freeCancellationDays: number;

  @ApiProperty({ description: "Refund percentage (0-100)" })
  @IsNumber()
  @Min(0)
  @Max(100)
  refundPercentage: number;
}

export class CreateAccommodationDto {
  @ApiProperty({
    description: "Accommodation type",
    enum: AccommodationType,
  })
  @IsEnum(AccommodationType)
  type: AccommodationType;

  @ApiProperty({ description: "Accommodation name" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: "Address information" })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiProperty({ description: "GPS location" })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty({ description: "Description" })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: "Image URLs", type: [String] })
  @IsArray()
  @IsString({ each: true })
  images: string[];

  @ApiProperty({ description: "Amenities list", type: [String] })
  @IsArray()
  @IsString({ each: true })
  amenities: string[];

  @ApiProperty({ description: "Policies" })
  @ValidateNested()
  @Type(() => PoliciesDto)
  policies: PoliciesDto;

  @ApiProperty({ description: "Cancellation policy" })
  @ValidateNested()
  @Type(() => CancellationPolicyDto)
  cancellationPolicy: CancellationPolicyDto;
}
