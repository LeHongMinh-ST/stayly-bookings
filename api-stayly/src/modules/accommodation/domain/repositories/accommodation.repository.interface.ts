/**
 * Accommodation Repository Interface
 * Defines contract for accommodation data access
 */

import { Accommodation } from "../entities/accommodation.entity";
import { AccommodationId } from "../value-objects/accommodation-id.vo";
import { AccommodationType } from "../entities/accommodation.entity";

export const ACCOMMODATION_REPOSITORY = "ACCOMMODATION_REPOSITORY";

export interface IAccommodationRepository {
  save(accommodation: Accommodation): Promise<void>;
  findById(id: AccommodationId): Promise<Accommodation | null>;
  findByOwnerId(
    ownerId: string,
    limit?: number,
    offset?: number,
    status?: string,
  ): Promise<Accommodation[]>;
  findByType(
    type: AccommodationType,
    limit?: number,
    offset?: number,
    status?: string,
  ): Promise<Accommodation[]>;
  findAll(
    limit?: number,
    offset?: number,
    status?: string,
  ): Promise<Accommodation[]>;
  count(filters?: {
    ownerId?: string;
    type?: AccommodationType;
    status?: string;
  }): Promise<number>;
  delete(id: AccommodationId): Promise<void>;
}
