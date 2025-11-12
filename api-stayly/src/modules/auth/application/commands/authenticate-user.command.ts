/**
 * AuthenticateUserCommand initiates credential validation for login
 */
export class AuthenticateUserCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly userAgent?: string | null,
    public readonly ipAddress?: string | null,
  ) {}
}
