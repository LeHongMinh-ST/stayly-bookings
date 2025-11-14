/**
 * ListAccommodationsQuery
 * Query to list accommodations with filters
 */

import { AccommodationType } from "../../domain/entities/accommodation.entity";

export class ListAccommodationsQuery {
  constructor(
    public readonly ownerId?: string,
    public readonly type?: AccommodationType,
    public readonly status?: string,
    public readonly limit?: number,
    public readonly offset?: number,
  ) {}
}
