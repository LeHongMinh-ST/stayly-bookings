/**
 * AssignRolesToUserCommand carries requested role updates for a user
 */
export class AssignRolesToUserCommand {
  constructor(
    public readonly userId: string,
    public readonly roles: string[],
  ) {}
}
