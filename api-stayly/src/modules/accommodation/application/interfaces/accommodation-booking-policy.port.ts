/**
 * IAccommodationBookingPolicyPort
 * Cross-module port to evaluate booking constraints for accommodation deletion
 */
export interface IAccommodationBookingPolicyPort {
  /**
   * Checks whether the accommodation has upcoming bookings within the provided window.
   * @param accommodationId - Target accommodation identifier
   * @param withinDays - Lookahead window in days
   */
  hasUpcomingBookings(
    accommodationId: string,
    withinDays: number,
  ): Promise<boolean>;
}

export const ACCOMMODATION_BOOKING_POLICY_PORT =
  "ACCOMMODATION_BOOKING_POLICY_PORT";
