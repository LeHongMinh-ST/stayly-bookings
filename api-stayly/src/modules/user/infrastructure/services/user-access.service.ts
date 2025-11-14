/**
 * UserAccessService implements IUserAccessPort and provides user lookup utilities.
 */
import { Inject, Injectable } from "@nestjs/common";
import type { IUserRepository } from "../../domain/repositories/user.repository.interface";
import { USER_REPOSITORY } from "../../domain/repositories/user.repository.interface";
import { UserId } from "../../domain/value-objects/user-id.vo";
import type { IUserAccessPort } from "../../application/interfaces/user-access.port";
import { UserResponseDto } from "../../application/dto/response/user-response.dto";
import { ensureEntityExists } from "../../../../common/application/exceptions";

@Injectable()
export class UserAccessService implements IUserAccessPort {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * Validates that the target user exists in persistence.
   * Throws an error if no matching user is found.
   */
  async ensureUserExists(userId: string): Promise<void> {
    const userIdVo = UserId.create(userId);
    ensureEntityExists(
      await this.userRepository.findById(userIdVo),
      "User",
      userId,
    );
  }

  /**
   * Loads user aggregate and maps it to response DTO for presentation concerns.
   */
  async getUserResponse(userId: string): Promise<UserResponseDto> {
    const userIdVo = UserId.create(userId);
    const user = ensureEntityExists(
      await this.userRepository.findById(userIdVo),
      "User",
      userId,
    );
    return UserResponseDto.fromAggregate(user);
  }
}
