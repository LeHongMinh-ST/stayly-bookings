/**
 * UserAuthController manages authentication flows for admin/staff users (login, refresh, logout)
 * Only accessible by users from users table (Super Admin, Owner, Manager, Staff)
 */
import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { CommandBus } from "@nestjs/cqrs";
import { Public } from "../../../../common/decorators/public.decorator";
import { JwtUserGuard } from "../../../../common/guards/jwt-user.guard";
import { LoginDto } from "../../application/dto/request/login.dto";
import { AuthenticateUserCommand } from "../../application/commands/authenticate-user.command";
import { TokenResponseDto } from "../../application/dto/response/token-response.dto";
import { RefreshTokenDto } from "../../application/dto/request/refresh-token.dto";
import { RefreshTokenCommand } from "../../application/commands/refresh-token.command";
import { RevokeSessionCommand } from "../../application/commands/revoke-session.command";
import type { Request } from "express";
import type { TokenService } from "../../../../common/application/interfaces/token-service.interface";
import { TOKEN_SERVICE } from "../../../../common/application/interfaces/token-service.interface";
import { ForgotPasswordRequestDto } from "../../application/dto/request/forgot-password-request.dto";
import { VerifyPasswordResetOtpDto } from "../../application/dto/request/verify-password-reset-otp.dto";
import { CompletePasswordResetDto } from "../../application/dto/request/complete-password-reset.dto";
import { RequestPasswordResetCommand } from "../../application/commands/request-password-reset.command";
import { PasswordResetRequestResponseDto } from "../../application/dto/response/password-reset-request-response.dto";
import { VerifyPasswordResetOtpCommand } from "../../application/commands/verify-password-reset-otp.command";
import { CompletePasswordResetCommand } from "../../application/commands/complete-password-reset.command";

@ApiTags("auth")
@Controller("v1/auth/user")
export class UserAuthController {
  constructor(
    private readonly commandBus: CommandBus,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Authenticates admin/staff users using credentials and returns token pair
   * Only authenticates users from users table (Super Admin, Owner, Manager, Staff)
   */
  @Post("login")
  @Public()
  @ApiOperation({
    summary: "Authenticate admin/staff user and get access tokens",
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: "Authentication successful, returns access and refresh tokens",
    type: TokenResponseDto,
  })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  @ApiResponse({ status: 400, description: "Bad request - validation failed" })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
  ): Promise<TokenResponseDto> {
    const { userAgent, ipAddress } = this.extractRequestMetadata(req);
    const command = new AuthenticateUserCommand(
      dto.email,
      dto.password,
      userAgent,
      ipAddress,
    );
    return this.commandBus.execute(command);
  }

  /**
   * Initiates password reset flow for admin/staff accounts
   */
  @Post("password/forgot")
  @Public()
  @HttpCode(202)
  @ApiOperation({
    summary: "Request password reset (admin/staff only)",
  })
  @ApiBody({ type: ForgotPasswordRequestDto })
  @ApiResponse({
    status: 202,
    description:
      "Reset instructions sent if account exists (request ID + expiry returned)",
    type: PasswordResetRequestResponseDto,
  })
  async forgotPassword(
    @Body() dto: ForgotPasswordRequestDto,
    @Req() req: Request,
  ): Promise<PasswordResetRequestResponseDto> {
    const { userAgent, ipAddress } = this.extractRequestMetadata(req);
    return this.commandBus.execute(
      new RequestPasswordResetCommand(dto.email, "user", userAgent, ipAddress),
    );
  }

  /**
   * Verifies OTP sent during admin/staff password reset flow
   */
  @Post("password/verify-otp")
  @Public()
  @HttpCode(204)
  @ApiOperation({
    summary: "Verify password reset OTP (admin/staff only)",
  })
  @ApiBody({ type: VerifyPasswordResetOtpDto })
  @ApiResponse({ status: 204, description: "OTP verified successfully" })
  @ApiResponse({
    status: 400,
    description: "Invalid OTP or request expired",
  })
  async verifyPasswordResetOtp(
    @Body() dto: VerifyPasswordResetOtpDto,
  ): Promise<void> {
    const command = new VerifyPasswordResetOtpCommand(
      dto.requestId,
      dto.otp,
      "user",
    );
    await this.commandBus.execute(command);
  }

  /**
   * Completes password reset for admin/staff accounts
   */
  @Post("password/reset")
  @Public()
  @HttpCode(204)
  @ApiOperation({
    summary: "Complete password reset using email token (admin/staff only)",
  })
  @ApiBody({ type: CompletePasswordResetDto })
  @ApiResponse({
    status: 204,
    description: "Password updated successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid token or OTP not verified",
  })
  async completePasswordReset(
    @Body() dto: CompletePasswordResetDto,
  ): Promise<void> {
    const command = new CompletePasswordResetCommand(
      dto.requestId,
      dto.token,
      dto.newPassword,
      "user",
    );
    await this.commandBus.execute(command);
  }

  /**
   * Issues a new token pair using a valid refresh token
   * Only works for user (admin/staff) tokens
   */
  @Post("refresh")
  @Public()
  @ApiOperation({
    summary: "Refresh access token using refresh token (admin/staff only)",
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description:
      "Token refresh successful, returns new access and refresh tokens",
    type: TokenResponseDto,
  })
  @ApiResponse({ status: 401, description: "Invalid or expired refresh token" })
  @ApiResponse({ status: 400, description: "Bad request - validation failed" })
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
  ): Promise<TokenResponseDto> {
    const { userAgent, ipAddress } = this.extractRequestMetadata(req);
    const command = new RefreshTokenCommand(
      dto.refreshToken,
      userAgent,
      ipAddress,
    );
    return this.commandBus.execute(command);
  }

  /**
   * Revokes refresh session associated with the given refresh token
   * Only works for user (admin/staff) tokens
   */
  @Post("logout")
  @UseGuards(JwtUserGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Logout and revoke refresh token session (admin/staff only)",
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: "Logout successful, refresh token session revoked",
  })
  @ApiResponse({ status: 400, description: "Bad request - validation failed" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async logout(@Body() dto: RefreshTokenDto): Promise<void> {
    const payload = await this.tokenService.verifyRefreshToken(
      dto.refreshToken,
    );
    const tokenId = payload.getProps().tokenId;
    if (!tokenId) {
      return;
    }
    await this.commandBus.execute(new RevokeSessionCommand(tokenId));
  }

  /**
   * Normalizes request metadata to consistently typed values for downstream commands
   */
  private extractRequestMetadata(req: Request): {
    userAgent: string | null;
    ipAddress: string | null;
  } {
    const { headers, ip } = req;
    const userAgentHeader = headers["user-agent"] as
      | string
      | string[]
      | undefined;
    const userAgent = Array.isArray(userAgentHeader)
      ? (userAgentHeader[0] ?? null)
      : (userAgentHeader ?? null);

    return {
      userAgent,
      ipAddress: typeof ip === "string" ? ip : null,
    };
  }
}
