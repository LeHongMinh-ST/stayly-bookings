/**
 * GetUserHandler loads a single administrative user by identifier
 */
import { Inject, Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserQuery } from '../get-user.query';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../domain/repositories/user.repository.interface';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { UserResponseDto } from '../../dto/response/user-response.dto';
import { ensureEntityExists } from '../../../../../common/application/exceptions';

@Injectable()
@QueryHandler(GetUserQuery)
export class GetUserHandler
  implements IQueryHandler<GetUserQuery, UserResponseDto>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * Executes query resolution returning mapped DTO
   */
  async execute(query: GetUserQuery): Promise<UserResponseDto> {
    const userId = UserId.create(query.userId);
    const user = ensureEntityExists(
      await this.userRepository.findById(userId),
      'User',
      userId.getValue(),
    );

    return UserResponseDto.fromAggregate(user);
  }
}
