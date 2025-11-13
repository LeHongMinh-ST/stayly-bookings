/**
 * AuthenticateUserHandler validates credentials and issues JWT tokens
 */
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { AuthenticateUserCommand } from '../authenticate-user.command';
import type { IUserAuthenticationService } from '../../interfaces/user-authentication.service.interface';
import { USER_AUTHENTICATION_SERVICE } from '../../interfaces/user-authentication.service.interface';
import type { IUserRolePermissionQueryService } from '../../interfaces/user-role-permission-query.service.interface';
import { USER_ROLE_PERMISSION_QUERY_SERVICE } from '../../interfaces/user-role-permission-query.service.interface';
import { Email } from '../../../../../common/domain/value-objects/email.vo';
import type { PasswordHasher } from '../../../../../common/application/interfaces/password-hasher.interface';
import { PASSWORD_HASHER } from '../../../../../common/application/interfaces/password-hasher.interface';
import type { TokenService } from '../../../../../common/application/interfaces/token-service.interface';
import { TOKEN_SERVICE } from '../../../../../common/application/interfaces/token-service.interface';
import type { ISessionRepository } from '../../../domain/repositories/session.repository.interface';
import { SESSION_REPOSITORY } from '../../../domain/repositories/session.repository.interface';
import { JwtPayload } from '../../../domain/value-objects/jwt-payload.vo';
import { Session } from '../../../domain/entities/session.entity';
import { TokenPair } from '../../../domain/value-objects/token-pair.vo';
import { TokenResponseDto } from '../../dto/response/token-response.dto';

@Injectable()
@CommandHandler(AuthenticateUserCommand)
export class AuthenticateUserHandler
  implements ICommandHandler<AuthenticateUserCommand, TokenResponseDto>
{
  constructor(
    @Inject(USER_AUTHENTICATION_SERVICE)
    private readonly userAuthService: IUserAuthenticationService,
    @Inject(USER_ROLE_PERMISSION_QUERY_SERVICE)
    private readonly userRolePermissionQueryService: IUserRolePermissionQueryService,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
  ) {}

  /**
   * Executes user (admin/staff) authentication returning signed token pair
   * Only authenticates users from users table, not customers
   */
  async execute(command: AuthenticateUserCommand): Promise<TokenResponseDto> {
    const email = Email.create(command.email);

    const userData = await this.userAuthService.findForAuthentication(email);
    if (!userData) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const matches = await this.passwordHasher.compare(
      command.password,
      userData.passwordHash,
    );
    if (!matches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!userData.isActive) {
      throw new BadRequestException('User is not active');
    }

    // Get roles and permissions from RBAC module
    const rolePermissionData =
      await this.userRolePermissionQueryService.getUserRolesAndPermissions(
        userData.id,
      );

    const payload = JwtPayload.create({
      sub: userData.id,
      email: userData.email,
      roles: rolePermissionData.roles,
      permissions: rolePermissionData.permissions,
      tokenId: randomUUID(),
      userType: 'user', // Mark as user for guard differentiation
    });

    return this.issueTokens(payload, command, userData.id);
  }

  private async issueTokens(
    payload: JwtPayload,
    command: AuthenticateUserCommand,
    userId: string,
  ): Promise<TokenResponseDto> {
    const tokenPair: TokenPair =
      await this.tokenService.issueTokenPair(payload);

    const session = Session.create({
      id: randomUUID(),
      userId: userId,
      userType: 'user',
      refreshToken: tokenPair.refreshToken,
      userAgent: command.userAgent ?? null,
      ipAddress: command.ipAddress ?? null,
    });
    await this.sessionRepository.save(session);

    return new TokenResponseDto(
      tokenPair.accessToken.getValue(),
      tokenPair.refreshToken.getValue(),
      'Bearer',
      tokenPair.accessToken.getExpiresInSeconds(),
    );
  }
}
