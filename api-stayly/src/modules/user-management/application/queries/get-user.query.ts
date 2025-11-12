/**
 * GetUserQuery retrieves a single administrative user by identifier
 */
export class GetUserQuery {
  constructor(public readonly userId: string) {}
}
