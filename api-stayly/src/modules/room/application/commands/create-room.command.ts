/**
 * CreateRoomCommand
 * Command to create a new room for homestay accommodation
 */

export class CreateRoomCommand {
  constructor(
    public readonly accommodationId: string,
    public readonly name: string,
    public readonly category: string,
    public readonly area: number,
    public readonly guestCapacity: {
      maxAdults: number;
      maxChildren?: number;
    },
    public readonly bedCount: number,
    public readonly bedType: string,
    public readonly description: string,
    public readonly amenities: string[],
    public readonly images: Array<{
      url: string;
      type?: string;
      order?: number;
    }>,
    public readonly inventory: number,
    public readonly basePrice?: {
      amount: number;
      currency: string;
    },
  ) {}
}
