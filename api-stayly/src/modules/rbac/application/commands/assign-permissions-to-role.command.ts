export class AssignPermissionsToRoleCommand {
  constructor(
    public readonly roleId: string,
    public readonly permissions: string[],
  ) {}
}
