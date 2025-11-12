/**
 * AssignRolesCommand carries requested role updates for a user
 */
export class AssignRolesCommand {
  constructor(
    public readonly userId: string,
    public readonly roles: string[],
  ) {}
}
