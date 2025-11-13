import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_OFFSET,
} from '../../../../common/constants';

/**
 * ListUsersQuery supports pagination and filtering for administrative users
 */
export class ListUsersQuery {
  constructor(
    public readonly limit: number = DEFAULT_PAGE_SIZE,
    public readonly offset: number = DEFAULT_PAGE_OFFSET,
  ) {}
}
