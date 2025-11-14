export class CreateRoleCommand {
  constructor(
    public readonly displayName: string,
    public readonly permissions?: string[],
  ) {}
}

