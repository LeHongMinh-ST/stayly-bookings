/**
 * AuthController manages authentication flows (login, refresh, logout)
 */
import { Body, Controller, Inject, Post, Request } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Public } from '../../../../common/decorators/public.decorator';
import { LoginDto } from '../../application/dto/login.dto';
import { AuthenticateUserCommand } from '../../application/commands/authenticate-user.command';
import { TokenResponseDto } from '../../application/dto/token-response.dto';
import { RefreshTokenDto } from '../../application/dto/refresh-token.dto';
import { RefreshTokenCommand } from '../../application/commands/refresh-token.command';
import { RevokeSessionCommand } from '../../application/commands/revoke-session.command';
import type { TokenService } from '../../../../common/application/interfaces/token-service.interface';
import { TOKEN_SERVICE } from '../../../../common/application/interfaces/token-service.interface';

@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Authenticates staff users using credentials and returns token pair
   */
  @Post('login')
  @Public()
  async login(
    @Body() dto: LoginDto,
    @Request() req: any,
  ): Promise<TokenResponseDto> {
    const command = new AuthenticateUserCommand(
      dto.email,
      dto.password,
      req.headers['user-agent'],
      req.ip,
    );
    return this.commandBus.execute(command);
  }

  /**
   * Issues a new token pair using a valid refresh token
   */
  @Post('refresh')
  @Public()
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
   */
  @Post('logout')
  async logout(@Body() dto: RefreshTokenDto): Promise<void> {
    const payload = await this.tokenService.verifyRefreshToken(dto.refreshToken);
    const tokenId = payload.getProps().tokenId;
    if (!tokenId) {
      return;
    }
    await this.commandBus.execute(new RevokeSessionCommand(tokenId));
  }
}
