/**
 * VerifyPasswordResetOtpHandler validates OTP submissions
 */
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

import { VerifyPasswordResetOtpCommand } from "../verify-password-reset-otp.command";
import { PasswordResetUtil } from "../../utils/password-reset.util";
import type { IPasswordResetRequestRepository } from "../../../domain/repositories/password-reset-request.repository.interface";
import { PASSWORD_RESET_REQUEST_REPOSITORY } from "../../../domain/repositories/password-reset-request.repository.interface";
import { PasswordResetRequestId } from "../../../domain/value-objects/password-reset-request-id.vo";
import type { PasswordResetRequest } from "../../../domain/entities/password-reset-request.entity";
import { InvalidOperationError } from "../../../../../common/domain/errors";

@Injectable()
@CommandHandler(VerifyPasswordResetOtpCommand)
export class VerifyPasswordResetOtpHandler
  implements ICommandHandler<VerifyPasswordResetOtpCommand, void>
{
  private readonly logger = new Logger(VerifyPasswordResetOtpHandler.name);

  constructor(
    @Inject(PASSWORD_RESET_REQUEST_REPOSITORY)
    private readonly passwordResetRepository: IPasswordResetRequestRepository,
  ) {}

  /**
   * Verifies OTP and transitions request to otp_verified status
   */
  async execute(command: VerifyPasswordResetOtpCommand): Promise<void> {
    const request = await this.passwordResetRepository.findById(
      PasswordResetRequestId.create(command.requestId),
    );

    if (!request || request.getSubjectType() !== command.subjectType) {
      throw new BadRequestException("Invalid or expired OTP");
    }

    const now = new Date();
    const otpHash = PasswordResetUtil.hashSecret(command.otp);

    if (!request.isMatchingOtp(otpHash)) {
      await this.handleFailedAttempt(request, now);
      throw new BadRequestException("Invalid or expired OTP");
    }

    try {
      request.markOtpVerified(now);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.debug(`OTP verification failed: ${message}`);
      throw new BadRequestException("Invalid or expired OTP");
    }

    await this.passwordResetRepository.save(request);
  }

  private async handleFailedAttempt(
    request: PasswordResetRequest,
    at: Date,
  ): Promise<void> {
    try {
      request.registerFailedOtpAttempt(at);
    } catch (error) {
      if (!(error instanceof InvalidOperationError)) {
        throw error;
      }
      const message = error instanceof Error ? error.message : String(error);
      this.logger.debug(`OTP attempt rejected due to lifecycle: ${message}`);
    } finally {
      await this.passwordResetRepository.save(request);
    }
  }
}
