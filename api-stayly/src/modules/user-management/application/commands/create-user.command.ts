/**
 * CreateUserCommand carries payload for creating administrative users
 */
export class CreateUserCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly fullName: string,
    public readonly roles: string[],
    public readonly permissions: string[],
  ) {}
}
