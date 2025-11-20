/**
 * DeleteAccommodationCommand
 * Command to delete an existing accommodation
 */

export class DeleteAccommodationCommand {
  constructor(
    public readonly id: string,
    public readonly ownerId: string,
  ) {}
}
