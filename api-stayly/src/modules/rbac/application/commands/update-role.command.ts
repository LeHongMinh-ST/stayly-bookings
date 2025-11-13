export class UpdateRoleCommand {
  constructor(
    public readonly roleId: string,
    public readonly displayName?: string,
  ) {}
}

