/**
 * ListUsersHandler retrieves paginated administrative users
 */
import { Inject, Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListUsersQuery } from '../list-users.query';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../domain/repositories/user.repository.interface';
import { UserResponseDto } from '../../dto/user-response.dto';
import { UserCollectionDto } from '../../dto/user-collection.dto';

@Injectable()
@QueryHandler(ListUsersQuery)
export class ListUsersHandler
  implements IQueryHandler<ListUsersQuery, UserCollectionDto>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * Executes paginated user list retrieval
   */
  async execute(query: ListUsersQuery): Promise<UserCollectionDto> {
    const limit = Math.max(1, Math.min(query.limit, 100));
    const offset = Math.max(0, query.offset);

    const [users, total] = await Promise.all([
      this.userRepository.findMany(limit, offset),
      this.userRepository.count(),
    ]);

    const data = users.map((user) => UserResponseDto.fromAggregate(user));
    return new UserCollectionDto(data, total, limit, offset);
  }
}
