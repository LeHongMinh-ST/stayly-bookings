/**
 * FloorManagementService
 * Domain service for floor management (Hotel only)
 */

import { Floor } from "../entities/floor.entity";
import { Accommodation } from "../entities/accommodation.entity";
import { AccommodationType } from "../entities/accommodation.entity";

export class FloorManagementService {
  /**
   * Check if accommodation can have floors
   * Only Hotel type can have floors
   */
  canHaveFloors(accommodation: Accommodation): boolean {
    return accommodation.getType() === AccommodationType.HOTEL;
  }

  /**
   * Block floor and all rooms/services in it
   */
  blockFloor(floor: Floor): void {
    floor.blockForMaintenance();
  }

  /**
   * Activate floor
   */
  activateFloor(floor: Floor): void {
    floor.activate();
  }
}
