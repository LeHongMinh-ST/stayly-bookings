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
import { AccommodationDtoMapper } from "../../../infrastructure/persistence/mappers/accommodation-dto.mapper";

@QueryHandler(GetAccommodationQuery)
export class GetAccommodationHandler
  implements IQueryHandler<GetAccommodationQuery>
{
  constructor(
    @Inject(ACCOMMODATION_REPOSITORY)
    private readonly accommodationRepo: IAccommodationRepository,
    private readonly dtoMapper: AccommodationDtoMapper,
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

    return this.dtoMapper.toDto(accommodation);
  }
}
