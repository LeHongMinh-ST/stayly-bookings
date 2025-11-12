/**
 * ListUsersQuery supports pagination and filtering for administrative users
 */
export class ListUsersQuery {
  constructor(
    public readonly limit: number = 20,
    public readonly offset: number = 0,
  ) {}
}
