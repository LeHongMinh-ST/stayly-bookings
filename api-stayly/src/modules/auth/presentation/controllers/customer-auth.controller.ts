/**
 * CustomerAuthController manages authentication flows for customers (login, refresh, logout)
 * Only accessible by customers from customers table
 */
import { Body, Controller, Inject, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { Public } from '../../../../common/decorators/public.decorator';
import { JwtCustomerGuard } from '../../../../common/guards/jwt-customer.guard';
import { LoginDto } from '../../application/dto/request/login.dto';
import { AuthenticateCustomerCommand } from '../../application/commands/authenticate-customer.command';
import { TokenResponseDto } from '../../application/dto/response/token-response.dto';
import { RefreshTokenDto } from '../../application/dto/request/refresh-token.dto';
import { RefreshTokenCommand } from '../../application/commands/refresh-token.command';
import { RevokeSessionCommand } from '../../application/commands/revoke-session.command';
import type { TokenService } from '../../../../common/application/interfaces/token-service.interface';
import { TOKEN_SERVICE } from '../../../../common/application/interfaces/token-service.interface';

@ApiTags('auth')
@Controller('v1/customers/auth')
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
  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Authenticate customer and get access tokens' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful, returns access and refresh tokens',
    type: TokenResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  async login(
    @Body() dto: LoginDto,
    @Request() req: any,
  ): Promise<TokenResponseDto> {
    const command = new AuthenticateCustomerCommand(
      dto.email,
      dto.password,
      req.headers['user-agent'],
      req.ip,
    );
    return this.commandBus.execute(command);
  }

  /**
   * Issues a new token pair using a valid refresh token
   * Only works for customer tokens
   */
  @Post('refresh')
  @Public()
  @ApiOperation({ summary: 'Refresh access token using refresh token (customer only)' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Token refresh successful, returns new access and refresh tokens',
    type: TokenResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  async refresh(@Body() dto: RefreshTokenDto, @Request() req: any): Promise<TokenResponseDto> {
    const command = new RefreshTokenCommand(
      dto.refreshToken,
      req.headers['user-agent'],
      req.ip,
    );
    return this.commandBus.execute(command);
  }

  /**
   * Revokes refresh session associated with the given refresh token
   * Only works for customer tokens
   */
  @Post('logout')
  @UseGuards(JwtCustomerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout and revoke refresh token session (customer only)' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Logout successful, refresh token session revoked',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Body() dto: RefreshTokenDto): Promise<void> {
    const payload = await this.tokenService.verifyRefreshToken(dto.refreshToken);
    const tokenId = payload.getProps().tokenId;
    if (!tokenId) {
      return;
    }
    await this.commandBus.execute(new RevokeSessionCommand(tokenId));
  }
}

