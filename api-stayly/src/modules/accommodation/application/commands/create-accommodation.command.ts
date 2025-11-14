/**
 * CreateAccommodationCommand
 * Command to create a new accommodation (homestay or hotel)
 */

import { AccommodationType } from "../../domain/entities/accommodation.entity";

export class CreateAccommodationCommand {
  constructor(
    public readonly type: AccommodationType,
    public readonly name: string,
    public readonly ownerId: string,
    public readonly address: {
      street: string;
      ward: string;
      district: string;
      province: string;
      country: string;
    },
    public readonly location: {
      latitude: number;
      longitude: number;
    },
    public readonly description: string,
    public readonly images: string[],
    public readonly amenities: string[],
    public readonly policies: {
      checkInTime: string;
      checkOutTime: string;
      childrenAllowed: boolean;
      petsAllowed: boolean;
      smokingAllowed: boolean;
    },
    public readonly cancellationPolicy: {
      type: string;
      freeCancellationDays: number;
      refundPercentage: number;
    },
  ) {}
}
