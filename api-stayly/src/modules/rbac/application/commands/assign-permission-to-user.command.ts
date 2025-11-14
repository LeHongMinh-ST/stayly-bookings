/**
 * AssignPermissionToUserCommand assigns a single permission to a user
 */
export class AssignPermissionToUserCommand {
  constructor(
    public readonly permissionId: string,
    public readonly userId: string,
  ) {}
}
