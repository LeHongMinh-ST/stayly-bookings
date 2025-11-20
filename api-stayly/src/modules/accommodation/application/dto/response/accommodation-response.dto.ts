/**
 * AccommodationResponseDto
 * Response DTO for accommodation
 */

import { ApiProperty } from "@nestjs/swagger";
import { AccommodationType } from "../../../domain/entities/accommodation.entity";
import { AccommodationStatus } from "../../../domain/value-objects/accommodation-status.vo";

export class AccommodationResponseDto {
  @ApiProperty({ description: "Accommodation ID" })
  id: string;

  @ApiProperty({ description: "Accommodation type", enum: AccommodationType })
  type: AccommodationType;

  @ApiProperty({ description: "Accommodation name" })
  name: string;

  @ApiProperty({ description: "Status", enum: AccommodationStatus })
  status: AccommodationStatus;

  @ApiProperty({ description: "Owner ID" })
  ownerId: string;

  @ApiProperty({ description: "Address" })
  address: {
    street: string;
    ward: string;
    district: string;
    province: string;
    country: string;
  };

  @ApiProperty({ description: "GPS location" })
  location: {
    latitude: number;
    longitude: number;
  };

  @ApiProperty({ description: "Description" })
  description: string;

  @ApiProperty({ description: "Image URLs", type: [String] })
  images: string[];

  @ApiProperty({ description: "Amenities", type: [String] })
  amenities: string[];

  @ApiProperty({ description: "Policies" })
  policies: {
    checkInTime: string;
    checkOutTime: string;
    childrenAllowed: boolean;
    petsAllowed: boolean;
    smokingAllowed: boolean;
  };

  @ApiProperty({ description: "Cancellation policy" })
  cancellationPolicy: {
    type: string;
    freeCancellationDays: number;
    refundPercentage: number;
  };

  @ApiProperty({ description: "Created at" })
  createdAt: Date;

  @ApiProperty({ description: "Updated at" })
  updatedAt: Date;
}
