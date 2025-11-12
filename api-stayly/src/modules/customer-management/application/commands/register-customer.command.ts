/**
 * RegisterCustomerCommand carries data for self-service customer registration
 */
export class RegisterCustomerCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly fullName: string,
    public readonly phone?: string | null,
  ) {}
}
