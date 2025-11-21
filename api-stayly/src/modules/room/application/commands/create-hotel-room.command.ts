/**
 * CreateHotelRoomCommand
 * Command to create a new physical hotel room under a room type
 */

export class CreateHotelRoomCommand {
  constructor(
    public readonly roomTypeId: string,
    public readonly roomNumber: string,
    public readonly floorId?: string,
    public readonly notes?: string,
  ) {}
}
