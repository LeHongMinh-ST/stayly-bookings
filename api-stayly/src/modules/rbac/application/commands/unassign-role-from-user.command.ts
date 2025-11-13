/**
 * UnassignRoleFromUserCommand removes a single role from a user
 */
export class UnassignRoleFromUserCommand {
  constructor(
    public readonly roleId: string,
    public readonly userId: string,
  ) {}
}

