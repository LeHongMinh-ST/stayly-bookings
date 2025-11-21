/**
 * RequestPasswordResetHandler orchestrates OTP + token issuance
 */
import { Inject, Injectable, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "crypto";

import { Email } from "../../../../../common/domain/value-objects/email.vo";
import { RequestPasswordResetCommand } from "../request-password-reset.command";
import type {
  CustomerAuthenticationData,
  ICustomerAuthenticationService,
} from "../../interfaces/customer-authentication.service.interface";
import { CUSTOMER_AUTHENTICATION_SERVICE } from "../../interfaces/customer-authentication.service.interface";
import type {
  IUserAuthenticationService,
  UserAuthenticationData,
} from "../../interfaces/user-authentication.service.interface";
import { USER_AUTHENTICATION_SERVICE } from "../../interfaces/user-authentication.service.interface";
import type { IPasswordResetRequestRepository } from "../../../domain/repositories/password-reset-request.repository.interface";
import { PASSWORD_RESET_REQUEST_REPOSITORY } from "../../../domain/repositories/password-reset-request.repository.interface";
import { PasswordResetRequest } from "../../../domain/entities/password-reset-request.entity";
import { PasswordResetRequestId } from "../../../domain/value-objects/password-reset-request-id.vo";
import type { PasswordResetSubjectType } from "../../../domain/types/password-reset.types";
import { PasswordResetUtil } from "../../utils/password-reset.util";
import { PasswordResetRequestResponseDto } from "../../dto/response/password-reset-request-response.dto";
import type {
  IPasswordResetNotificationService,
  PasswordResetNotificationPayload,
} from "../../interfaces/password-reset-notification.service.interface";
import { PASSWORD_RESET_NOTIFICATION_SERVICE } from "../../interfaces/password-reset-notification.service.interface";

type PasswordResetAccount = UserAuthenticationData | CustomerAuthenticationData;

@Injectable()
@CommandHandler(RequestPasswordResetCommand)
export class RequestPasswordResetHandler
  implements
    ICommandHandler<
      RequestPasswordResetCommand,
      PasswordResetRequestResponseDto
    >
{
  private readonly logger = new Logger(RequestPasswordResetHandler.name);

  constructor(
    @Inject(USER_AUTHENTICATION_SERVICE)
    private readonly userAuthService: IUserAuthenticationService,
    @Inject(CUSTOMER_AUTHENTICATION_SERVICE)
    private readonly customerAuthService: ICustomerAuthenticationService,
    @Inject(PASSWORD_RESET_REQUEST_REPOSITORY)
    private readonly passwordResetRepository: IPasswordResetRequestRepository,
    private readonly configService: ConfigService,
    @Inject(PASSWORD_RESET_NOTIFICATION_SERVICE)
    private readonly notificationService: IPasswordResetNotificationService,
  ) {}

  /**
   * Starts OTP + token reset flow, emitting notification event
   */
  async execute(
    command: RequestPasswordResetCommand,
  ): Promise<PasswordResetRequestResponseDto> {
    const email = Email.create(command.email);
    const account = await this.resolveAccount(command.subjectType, email);

    if (!account || !account.isActive) {
      this.logger.debug(
        `Password reset requested for non-existing or inactive account: ${email.getValue()}`,
      );
      return this.createMaskedResponse();
    }

    const now = new Date();
    await this.revokeActiveRequests(account.id, command.subjectType, now);

    const plainToken = PasswordResetUtil.generateToken();
    const plainOtp = PasswordResetUtil.generateOtp();
    const request = PasswordResetRequest.create({
      id: PasswordResetRequestId.create(randomUUID()),
      subjectId: account.id,
      subjectType: command.subjectType,
      tokenHash: PasswordResetUtil.hashSecret(plainToken),
      otpHash: PasswordResetUtil.hashSecret(plainOtp),
      expiresAt: this.addMinutes(now, this.getTokenTtlMinutes()),
      otpExpiresAt: this.addMinutes(now, this.getOtpTtlMinutes()),
      maxAttempts: this.getMaxOtpAttempts(),
      plainToken,
      plainOtp,
      requestedIp: command.ipAddress,
      requestedUserAgent: command.userAgent,
    });

    await this.passwordResetRepository.save(request);
    await this.notifyUser(
      account.email,
      command.subjectType,
      plainOtp,
      plainToken,
      request,
    );

    return new PasswordResetRequestResponseDto(
      request.getId().getValue(),
      request.getExpiresAt(),
      request.getOtpExpiresAt(),
    );
  }

  private async notifyUser(
    email: string,
    subjectType: PasswordResetSubjectType,
    otp: string,
    token: string,
    request: PasswordResetRequest,
  ): Promise<void> {
    const payload: PasswordResetNotificationPayload = {
      email,
      subjectType,
      otp,
      token,
      requestId: request.getId().getValue(),
      expiresAt: request.getExpiresAt(),
      otpExpiresAt: request.getOtpExpiresAt(),
    };
    await this.notificationService.sendResetInstructions(payload);
  }

  private async resolveAccount(
    subjectType: PasswordResetSubjectType,
    email: Email,
  ): Promise<PasswordResetAccount | null> {
    if (subjectType === "user") {
      return this.userAuthService.findForAuthentication(email);
    }
    return this.customerAuthService.findForAuthentication(email);
  }

  private async revokeActiveRequests(
    subjectId: string,
    subjectType: PasswordResetSubjectType,
    at: Date,
  ): Promise<void> {
    const activeRequest =
      await this.passwordResetRepository.findLatestBySubject(
        subjectId,
        subjectType,
        ["pending", "otp_verified"],
      );

    if (!activeRequest) {
      return;
    }

    activeRequest.revoke(at);
    await this.passwordResetRepository.save(activeRequest);
  }

  private getTokenTtlMinutes(): number {
    return (
      Number(this.configService.get("auth.passwordReset.tokenTtlMinutes")) || 60
    );
  }

  private getOtpTtlMinutes(): number {
    return (
      Number(this.configService.get("auth.passwordReset.otpTtlMinutes")) || 10
    );
  }

  private getMaxOtpAttempts(): number {
    return (
      Number(this.configService.get("auth.passwordReset.maxOtpAttempts")) || 5
    );
  }

  private addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60 * 1000);
  }

  private createMaskedResponse(): PasswordResetRequestResponseDto {
    const placeholderId = randomUUID();
    const now = new Date();
    return new PasswordResetRequestResponseDto(
      placeholderId,
      this.addMinutes(now, this.getTokenTtlMinutes()),
      this.addMinutes(now, this.getOtpTtlMinutes()),
    );
  }
}
