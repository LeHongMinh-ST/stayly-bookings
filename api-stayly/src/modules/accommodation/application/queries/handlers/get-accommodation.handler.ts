/**
 * GetAccommodationHandler
 * Handles GetAccommodationQuery
 */

import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { GetAccommodationQuery } from "../get-accommodation.query";
import { ACCOMMODATION_REPOSITORY } from "../../../domain/repositories/accommodation.repository.interface";
import type { IAccommodationRepository } from "../../../domain/repositories/accommodation.repository.interface";
import { AccommodationId } from "../../../domain/value-objects/accommodation-id.vo";
import { AccommodationResponseDto } from "../../dto/response/accommodation-response.dto";
import { AccommodationMapper } from "../../../infrastructure/persistence/mappers/accommodation.mapper";

@QueryHandler(GetAccommodationQuery)
export class GetAccommodationHandler
  implements IQueryHandler<GetAccommodationQuery>
{
  constructor(
    @Inject(ACCOMMODATION_REPOSITORY)
    private readonly accommodationRepo: IAccommodationRepository,
    private readonly mapper: AccommodationMapper,
  ) {}

  async execute(
    query: GetAccommodationQuery,
  ): Promise<AccommodationResponseDto | null> {
    const accommodation = await this.accommodationRepo.findById(
      AccommodationId.create(query.accommodationId),
    );

    if (!accommodation) {
      return null;
    }

    return this.toDto(accommodation);
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
