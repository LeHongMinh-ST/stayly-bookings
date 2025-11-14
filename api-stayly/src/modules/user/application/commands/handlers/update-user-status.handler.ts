/**
 * UpdateUserStatusHandler manages user lifecycle transitions
 */
import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserStatusCommand } from '../update-user-status.command';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../domain/repositories/user.repository.interface';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { Status } from '../../../domain/value-objects/user-status.vo';
import { UserResponseDto } from '../../dto/response/user-response.dto';
import { ensureEntityExists } from '../../../../../common/application/exceptions';

@Injectable()
@CommandHandler(UpdateUserStatusCommand)
export class UpdateUserStatusHandler
  implements ICommandHandler<UpdateUserStatusCommand, UserResponseDto>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * Executes status change with validation and persistence
   */
  async execute(command: UpdateUserStatusCommand): Promise<UserResponseDto> {
    const userId = UserId.create(command.userId);
    const user = ensureEntityExists(
      await this.userRepository.findById(userId),
      'User',
      userId.getValue(),
    );

    user.updateStatus(Status.create(command.status));
    await this.userRepository.save(user);

    return UserResponseDto.fromAggregate(user);
  }
}
