/**
 * UserCollectionDto represents paginated administrative user list results
 */
import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';

export class UserCollectionDto {
  @ApiProperty({
    description: 'Array of user items',
    type: [UserResponseDto],
  })
  data!: UserResponseDto[];

  @ApiProperty({
    description: 'Total number of users',
    example: 100,
  })
  total!: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
  })
  limit!: number;

  @ApiProperty({
    description: 'Number of items skipped',
    example: 0,
  })
  offset!: number;

  constructor(
    data: UserResponseDto[],
    total: number,
    limit: number,
    offset: number,
  ) {
    this.data = data;
    this.total = total;
    this.limit = limit;
    this.offset = offset;
  }
}
