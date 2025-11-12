/**
 * AuthenticateCustomerCommand initiates credential validation for customer login
 */
export class AuthenticateCustomerCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly userAgent?: string | null,
    public readonly ipAddress?: string | null,
  ) {}
}

