/**
 * AccommodationStatusService
 * Domain service for accommodation status management
 */

import { Accommodation } from "../entities/accommodation.entity";

export class AccommodationStatusService {
  /**
   * Activate accommodation
   * Only approved accommodations can be activated
   */
  activate(accommodation: Accommodation): void {
    accommodation.activate();
  }

  /**
   * Suspend accommodation
   * Only active accommodations can be suspended
   */
  suspend(accommodation: Accommodation): void {
    accommodation.suspend();
  }
}
