/**
 * ListAccommodationsHandler
 * Handles ListAccommodationsQuery
 */

import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { ListAccommodationsQuery } from "../list-accommodations.query";
import { ACCOMMODATION_REPOSITORY } from "../../../domain/repositories/accommodation.repository.interface";
import type { IAccommodationRepository } from "../../../domain/repositories/accommodation.repository.interface";
import { AccommodationResponseDto } from "../../dto/response/accommodation-response.dto";

@QueryHandler(ListAccommodationsQuery)
export class ListAccommodationsHandler
  implements IQueryHandler<ListAccommodationsQuery>
{
  constructor(
    @Inject(ACCOMMODATION_REPOSITORY)
    private readonly accommodationRepo: IAccommodationRepository,
  ) {}

  async execute(
    query: ListAccommodationsQuery,
  ): Promise<AccommodationResponseDto[]> {
    let accommodations;

    if (query.ownerId) {
      accommodations = await this.accommodationRepo.findByOwnerId(
        query.ownerId,
      );
    } else if (query.type) {
      accommodations = await this.accommodationRepo.findByType(query.type);
    } else {
      accommodations = await this.accommodationRepo.findAll();
    }

    // TODO: Filter by status if provided
    // TODO: Apply pagination (limit, offset)

    return accommodations.map((acc) => this.toDto(acc));
  }

  private toDto(accommodation: any): AccommodationResponseDto {
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
      createdAt: new Date(), // TODO: Get from ORM entity
      updatedAt: new Date(), // TODO: Get from ORM entity
    };
  }
}
