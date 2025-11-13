/**
 * AssignRoleToUserCommand assigns a single role to a user
 */
export class AssignRoleToUserCommand {
  constructor(
    public readonly roleId: string,
    public readonly userId: string,
  ) {}
}

