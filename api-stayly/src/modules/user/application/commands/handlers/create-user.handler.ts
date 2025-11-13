/**
 * CreateUserHandler orchestrates administrative user creation workflow
 */
import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { CreateUserCommand } from '../create-user.command';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../domain/repositories/user.repository.interface';
import type { PasswordHasher } from '../../../../../common/application/interfaces/password-hasher.interface';
import { PASSWORD_HASHER } from '../../../../../common/application/interfaces/password-hasher.interface';
import { Email } from '../../../../../common/domain/value-objects/email.vo';
import { PasswordHash } from '../../../../../common/domain/value-objects/password-hash.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { User } from '../../../domain/entities/user.entity';
import { UserResponseDto } from '../../dto/response/user-response.dto';

@Injectable()
@CommandHandler(CreateUserCommand)
export class CreateUserHandler
  implements ICommandHandler<CreateUserCommand, UserResponseDto>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
  ) {}

  /**
   * Executes user creation by validating input, hashing password, and persisting aggregate
   */
  async execute(command: CreateUserCommand): Promise<UserResponseDto> {
    const email = Email.create(command.email);
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User with email already exists');
    }

    const passwordHashValue = await this.passwordHasher.hash(command.password);
    const passwordHash = PasswordHash.create(passwordHashValue);

    const user = User.create({
      id: UserId.create(randomUUID()),
      email,
      fullName: command.fullName,
      passwordHash,
    });

    await this.userRepository.save(user);
    return UserResponseDto.fromAggregate(user);
  }
}
