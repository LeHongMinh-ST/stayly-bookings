/**
 * AssignPermissionsToUserCommand carries requested permission updates for a user
 */
export class AssignPermissionsToUserCommand {
  constructor(
    public readonly userId: string,
    public readonly permissions: string[],
  ) {}
}
