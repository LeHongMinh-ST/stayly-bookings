/**
 * ListAccommodationsHandler
 * Handles ListAccommodationsQuery
 */

import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { ListAccommodationsQuery } from "../list-accommodations.query";
import { ACCOMMODATION_REPOSITORY } from "../../../domain/repositories/accommodation.repository.interface";
import type { IAccommodationRepository } from "../../../domain/repositories/accommodation.repository.interface";
import { AccommodationCollectionDto } from "../../dto/response/accommodation-collection.dto";
import { AccommodationDtoMapper } from "../../../infrastructure/persistence/mappers/accommodation-dto.mapper";
import { Accommodation } from "../../../domain/entities/accommodation.entity";

@QueryHandler(ListAccommodationsQuery)
export class ListAccommodationsHandler
  implements IQueryHandler<ListAccommodationsQuery, AccommodationCollectionDto>
{
  constructor(
    @Inject(ACCOMMODATION_REPOSITORY)
    private readonly accommodationRepo: IAccommodationRepository,
    private readonly dtoMapper: AccommodationDtoMapper,
  ) {}

  async execute(
    query: ListAccommodationsQuery,
  ): Promise<AccommodationCollectionDto> {
    // Validate and normalize pagination params using common helper
    const { page, limit, offset } = query.normalize();

    // Build filters for count
    const filters = {
      ownerId: query.ownerId,
      type: query.type,
      status: query.status,
    };

    // Fetch accommodations and total count in parallel
    const [accommodations, total] = await Promise.all([
      this.fetchAccommodations(query, limit, offset),
      this.accommodationRepo.count(filters),
    ]);

    // Map to DTOs
    const data = accommodations.map((acc) => this.dtoMapper.toDto(acc));

    return new AccommodationCollectionDto(data, total, limit, page);
  }

  private async fetchAccommodations(
    query: ListAccommodationsQuery,
    limit: number,
    offset: number,
  ): Promise<Accommodation[]> {
    if (query.ownerId) {
      return this.accommodationRepo.findByOwnerId(
        query.ownerId,
        limit,
        offset,
        query.status,
      );
    }
    if (query.type) {
      return this.accommodationRepo.findByType(
        query.type,
        limit,
        offset,
        query.status,
      );
    }
    return this.accommodationRepo.findAll(limit, offset, query.status);
  }
}
