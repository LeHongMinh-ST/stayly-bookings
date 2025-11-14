import {
  DEFAULT_PAGE_OFFSET,
  DEFAULT_PAGE_SIZE,
} from '../../../../common/constants';

/**
 * ListPermissionsQuery retrieves all available permissions from catalog
 */
export class ListPermissionsQuery {
  constructor(
    public readonly limit: number = DEFAULT_PAGE_SIZE,
    public readonly offset: number = DEFAULT_PAGE_OFFSET,
    public readonly search: string = '',
  ) {}
}
