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
  findByOwnerId(ownerId: string): Promise<Accommodation[]>;
  findByType(type: AccommodationType): Promise<Accommodation[]>;
  findAll(): Promise<Accommodation[]>;
  delete(id: AccommodationId): Promise<void>;
}
