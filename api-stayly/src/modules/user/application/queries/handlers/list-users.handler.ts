/**
 * ListUsersHandler retrieves paginated administrative users
 */
import { Inject, Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { ListUsersQuery } from "../list-users.query";
import type { IUserRepository } from "../../../domain/repositories/user.repository.interface";
import { USER_REPOSITORY } from "../../../domain/repositories/user.repository.interface";
import { UserResponseDto } from "../../dto/response/user-response.dto";
import { UserCollectionDto } from "../../dto/response/user-collection.dto";

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
    // Validate and normalize pagination params using common helper
    const { page, limit, offset } = query.normalize();

    const [users, total] = await Promise.all([
      this.userRepository.findMany(limit, offset),
      this.userRepository.count(),
    ]);

    const data = users.map((user) => UserResponseDto.fromAggregate(user));
    return new UserCollectionDto(data, total, limit, page);
  }
}
