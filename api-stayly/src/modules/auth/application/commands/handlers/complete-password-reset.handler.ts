/**
 * CompletePasswordResetHandler sets new password after OTP verified
 */
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

import { CompletePasswordResetCommand } from "../complete-password-reset.command";
import { PasswordResetUtil } from "../../utils/password-reset.util";
import type { IPasswordResetRequestRepository } from "../../../domain/repositories/password-reset-request.repository.interface";
import { PASSWORD_RESET_REQUEST_REPOSITORY } from "../../../domain/repositories/password-reset-request.repository.interface";
import type { PasswordHasher } from "../../../../../common/application/interfaces/password-hasher.interface";
import { PASSWORD_HASHER } from "../../../../../common/application/interfaces/password-hasher.interface";
import { PasswordHash } from "../../../../../common/domain/value-objects/password-hash.vo";
import type { IUserAuthenticationService } from "../../interfaces/user-authentication.service.interface";
import { USER_AUTHENTICATION_SERVICE } from "../../interfaces/user-authentication.service.interface";
import type { ICustomerAuthenticationService } from "../../interfaces/customer-authentication.service.interface";
import { CUSTOMER_AUTHENTICATION_SERVICE } from "../../interfaces/customer-authentication.service.interface";
import type { ISessionRepository } from "../../../domain/repositories/session.repository.interface";
import { SESSION_REPOSITORY } from "../../../domain/repositories/session.repository.interface";

@Injectable()
@CommandHandler(CompletePasswordResetCommand)
export class CompletePasswordResetHandler
  implements ICommandHandler<CompletePasswordResetCommand, void>
{
  private readonly logger = new Logger(CompletePasswordResetHandler.name);

  constructor(
    @Inject(PASSWORD_RESET_REQUEST_REPOSITORY)
    private readonly passwordResetRepository: IPasswordResetRequestRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    @Inject(USER_AUTHENTICATION_SERVICE)
    private readonly userAuthService: IUserAuthenticationService,
    @Inject(CUSTOMER_AUTHENTICATION_SERVICE)
    private readonly customerAuthService: ICustomerAuthenticationService,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
  ) {}

  /**
   * Completes reset and revokes all active refresh sessions
   */
  async execute(command: CompletePasswordResetCommand): Promise<void> {
    const tokenHash = PasswordResetUtil.hashSecret(command.token);
    const request =
      await this.passwordResetRepository.findByTokenHash(tokenHash);

    if (!request) {
      throw new BadRequestException("Invalid or expired reset token");
    }

    if (request.getId().getValue() !== command.requestId) {
      this.logger.warn("Token mismatch detected during password reset");
      throw new BadRequestException("Invalid or expired reset token");
    }

    if (request.getSubjectType() !== command.subjectType) {
      throw new BadRequestException("Invalid or expired reset token");
    }

    if (request.getStatus() !== "otp_verified") {
      throw new BadRequestException("OTP confirmation required");
    }

    const hashedPassword = await this.passwordHasher.hash(command.newPassword);
    const passwordHashVo = PasswordHash.create(hashedPassword);
    await this.updateAccountPassword(
      request.getSubjectType(),
      request.getSubjectId(),
      passwordHashVo,
    );

    const now = new Date();
    try {
      request.markCompleted(now);
    } catch (error) {
      this.logger.warn(`Failed to mark reset as completed: ${error}`);
      throw new BadRequestException("Invalid or expired reset token");
    }
    await this.passwordResetRepository.save(request);
    await this.sessionRepository.revokeAllBySubject(
      request.getSubjectId(),
      request.getSubjectType(),
      now,
    );
  }

  private async updateAccountPassword(
    subjectType: CompletePasswordResetCommand["subjectType"],
    subjectId: string,
    passwordHash: PasswordHash,
  ): Promise<void> {
    if (subjectType === "user") {
      await this.userAuthService.updatePasswordHash(subjectId, passwordHash);
      return;
    }
    await this.customerAuthService.updatePasswordHash(subjectId, passwordHash);
  }
}
