/**
 * ApproveAccommodationCommand
 * Command to approve an accommodation (Super Admin only)
 */

export class ApproveAccommodationCommand {
  constructor(
    public readonly accommodationId: string,
    public readonly approvedBy: string,
  ) {}
}
