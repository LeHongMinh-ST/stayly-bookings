/**
 * CustomerAuthController manages authentication flows for customers (login, refresh, logout)
 * Only accessible by customers from customers table
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
import { JwtCustomerGuard } from "../../../../common/guards/jwt-customer.guard";
import { LoginDto } from "../../application/dto/request/login.dto";
import { AuthenticateCustomerCommand } from "../../application/commands/authenticate-customer.command";
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
@Controller("v1/auth/customers")
export class CustomerAuthController {
  constructor(
    private readonly commandBus: CommandBus,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Authenticates customers using credentials and returns token pair
   * Only authenticates customers from customers table
   */
  @Post("login")
  @Public()
  @ApiOperation({ summary: "Authenticate customer and get access tokens" })
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
    const command = new AuthenticateCustomerCommand(
      dto.email,
      dto.password,
      userAgent,
      ipAddress,
    );
    return this.commandBus.execute(command);
  }

  /**
   * Initiates password reset flow for customer accounts
   */
  @Post("password/forgot")
  @Public()
  @HttpCode(202)
  @ApiOperation({
    summary: "Request password reset (customer)",
  })
  @ApiBody({ type: ForgotPasswordRequestDto })
  @ApiResponse({
    status: 202,
    description: "Reset instructions sent when account exists",
    type: PasswordResetRequestResponseDto,
  })
  async forgotPassword(
    @Body() dto: ForgotPasswordRequestDto,
    @Req() req: Request,
  ): Promise<PasswordResetRequestResponseDto> {
    const { userAgent, ipAddress } = this.extractRequestMetadata(req);
    return this.commandBus.execute(
      new RequestPasswordResetCommand(
        dto.email,
        "customer",
        userAgent,
        ipAddress,
      ),
    );
  }

  /**
   * Verifies OTP for customer password reset
   */
  @Post("password/verify-otp")
  @Public()
  @HttpCode(204)
  @ApiOperation({
    summary: "Verify password reset OTP (customer)",
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
    await this.commandBus.execute(
      new VerifyPasswordResetOtpCommand(dto.requestId, dto.otp, "customer"),
    );
  }

  /**
   * Completes customer password reset using token from email link
   */
  @Post("password/reset")
  @Public()
  @HttpCode(204)
  @ApiOperation({
    summary: "Complete password reset using email token (customer)",
  })
  @ApiBody({ type: CompletePasswordResetDto })
  @ApiResponse({ status: 204, description: "Password updated successfully" })
  @ApiResponse({
    status: 400,
    description: "Invalid token or OTP not verified",
  })
  async completePasswordReset(
    @Body() dto: CompletePasswordResetDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new CompletePasswordResetCommand(
        dto.requestId,
        dto.token,
        dto.newPassword,
        "customer",
      ),
    );
  }

  /**
   * Issues a new token pair using a valid refresh token
   * Only works for customer tokens
   */
  @Post("refresh")
  @Public()
  @ApiOperation({
    summary: "Refresh access token using refresh token (customer only)",
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
   * Only works for customer tokens
   */
  @Post("logout")
  @UseGuards(JwtCustomerGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Logout and revoke refresh token session (customer only)",
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
   * Normalizes request metadata for consistent downstream auditing
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
