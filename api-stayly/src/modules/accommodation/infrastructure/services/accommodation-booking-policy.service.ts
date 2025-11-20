/**
 * AccommodationBookingPolicyService
 * Adapter stub that will later interact with Booking context
 */
import { Injectable, Logger } from "@nestjs/common";
import {
  ACCOMMODATION_BOOKING_POLICY_PORT,
  IAccommodationBookingPolicyPort,
} from "../../application/interfaces/accommodation-booking-policy.port";

@Injectable()
export class AccommodationBookingPolicyService
  implements IAccommodationBookingPolicyPort
{
  private readonly logger = new Logger(AccommodationBookingPolicyService.name);

  hasUpcomingBookings(accommodationId: string, withinDays: number): boolean {
    this.logger.debug(
      `Default booking policy adapter invoked for accommodation ${accommodationId} with window ${withinDays} days`,
    );
    // TODO: Integrate with Booking bounded context once available.
    return false;
  }
}

export const ACCOMMODATION_BOOKING_POLICY_SERVICE = {
  provide: ACCOMMODATION_BOOKING_POLICY_PORT,
  useClass: AccommodationBookingPolicyService,
};
