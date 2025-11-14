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
import { AccommodationDtoMapper } from "../../../infrastructure/persistence/mappers/accommodation-dto.mapper";
import { Accommodation } from "../../../domain/entities/accommodation.entity";

@QueryHandler(ListAccommodationsQuery)
export class ListAccommodationsHandler
  implements IQueryHandler<ListAccommodationsQuery>
{
  constructor(
    @Inject(ACCOMMODATION_REPOSITORY)
    private readonly accommodationRepo: IAccommodationRepository,
    private readonly dtoMapper: AccommodationDtoMapper,
  ) {}

  async execute(
    query: ListAccommodationsQuery,
  ): Promise<AccommodationResponseDto[]> {
    let accommodations: Accommodation[];

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

    return accommodations.map((acc) => this.dtoMapper.toDto(acc));
  }
}
