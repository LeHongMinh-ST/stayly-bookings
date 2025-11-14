/**
 * AccommodationDtoMapper
 * Maps Domain Entity to Response DTO
 */

import { Injectable } from "@nestjs/common";
import { Accommodation } from "../../../domain/entities/accommodation.entity";
import { AccommodationResponseDto } from "../../../application/dto/response/accommodation-response.dto";

@Injectable()
export class AccommodationDtoMapper {
  toDto(accommodation: Accommodation): AccommodationResponseDto {
    return {
      id: accommodation.getId().getValue(),
      type: accommodation.getType(),
      name: accommodation.getName(),
      status: accommodation.getStatus().getValue(),
      ownerId: accommodation.getOwnerId(),
      address: {
        street: accommodation.getAddress().getStreet(),
        ward: accommodation.getAddress().getWard(),
        district: accommodation.getAddress().getDistrict(),
        province: accommodation.getAddress().getProvince(),
        country: accommodation.getAddress().getCountry(),
      },
      location: {
        latitude: accommodation.getLocation().getLatitude(),
        longitude: accommodation.getLocation().getLongitude(),
      },
      description: accommodation.getDescription(),
      images: accommodation.getImages(),
      amenities: accommodation.getAmenities(),
      policies: {
        checkInTime: accommodation.getPolicies().getCheckInTime(),
        checkOutTime: accommodation.getPolicies().getCheckOutTime(),
        childrenAllowed: accommodation.getPolicies().isChildrenAllowed(),
        petsAllowed: accommodation.getPolicies().isPetsAllowed(),
        smokingAllowed: accommodation.getPolicies().isSmokingAllowed(),
      },
      cancellationPolicy: {
        type: accommodation.getCancellationPolicy().getType(),
        freeCancellationDays: accommodation
          .getCancellationPolicy()
          .getFreeCancellationDays(),
        refundPercentage: accommodation
          .getCancellationPolicy()
          .getRefundPercentage(),
      },
      approvedBy: accommodation.getApprovedBy(),
      approvedAt: accommodation.getApprovedAt(),
      createdAt: new Date(), // TODO: Get from ORM entity if needed
      updatedAt: new Date(), // TODO: Get from ORM entity if needed
    };
  }
}
