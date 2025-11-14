/**
 * UnassignPermissionFromUserCommand removes a single permission from a user
 */
export class UnassignPermissionFromUserCommand {
  constructor(
    public readonly permissionId: string,
    public readonly userId: string,
  ) {}
}
