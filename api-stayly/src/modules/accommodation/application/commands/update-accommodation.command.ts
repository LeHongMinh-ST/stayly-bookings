/**
 * UpdateAccommodationCommand
 * Command to update an existing accommodation
 */

export class UpdateAccommodationCommand {
  constructor(
    public readonly id: string,
    public readonly ownerId: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly images?: string[],
    public readonly amenities?: string[],
    public readonly policies?: {
      checkInTime: string;
      checkOutTime: string;
      childrenAllowed: boolean;
      petsAllowed: boolean;
      smokingAllowed: boolean;
    },
    public readonly cancellationPolicy?: {
      type: string;
      freeCancellationDays: number;
      refundPercentage: number;
    },
    public readonly address?: {
      street: string;
      ward: string;
      district: string;
      province: string;
      country: string;
    },
    public readonly location?: {
      latitude: number;
      longitude: number;
    },
    public readonly starRating?: number,
  ) {}
}
