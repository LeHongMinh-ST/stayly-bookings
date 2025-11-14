/**
 * AccommodationApprovalService
 * Domain service for accommodation approval business logic
 */

import { Accommodation } from "../entities/accommodation.entity";

export class AccommodationApprovalService {
  /**
   * Approve accommodation
   * Only Super Admin can approve
   */
  approve(accommodation: Accommodation, approvedBy: string): void {
    accommodation.approve(approvedBy);
  }

  /**
   * Reject accommodation
   * Only Super Admin can reject
   */
  reject(accommodation: Accommodation, approvedBy: string): void {
    accommodation.reject(approvedBy);
  }
}
