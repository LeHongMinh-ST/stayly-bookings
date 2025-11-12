/**
 * UserCollectionDto represents paginated administrative user list results
 */
import { UserResponseDto } from './user-response.dto';

export class UserCollectionDto {
  constructor(
    public readonly data: UserResponseDto[],
    public readonly total: number,
    public readonly limit: number,
    public readonly offset: number,
  ) {}
}
