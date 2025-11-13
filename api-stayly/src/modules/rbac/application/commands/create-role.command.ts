export class CreateRoleCommand {
  constructor(
    public readonly code: string,
    public readonly displayName: string,
    public readonly permissions?: string[],
  ) {}
}

