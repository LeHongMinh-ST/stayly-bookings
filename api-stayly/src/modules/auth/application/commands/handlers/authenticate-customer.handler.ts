/**
 * AuthenticateCustomerHandler validates customer credentials and issues JWT tokens
 */
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { AuthenticateCustomerCommand } from '../authenticate-customer.command';
import type { ICustomerAuthenticationService } from '../../interfaces/customer-authentication.service.interface';
import { CUSTOMER_AUTHENTICATION_SERVICE } from '../../interfaces/customer-authentication.service.interface';
import { Email } from '../../../../../common/domain/value-objects/email.vo';
import type { PasswordHasher } from '../../../../../common/application/interfaces/password-hasher.interface';
import { PASSWORD_HASHER } from '../../../../../common/application/interfaces/password-hasher.interface';
import type { TokenService } from '../../../../../common/application/interfaces/token-service.interface';
import { TOKEN_SERVICE } from '../../../../../common/application/interfaces/token-service.interface';
import type { ISessionRepository } from '../../../domain/repositories/session.repository.interface';
import { SESSION_REPOSITORY } from '../../../domain/repositories/session.repository.interface';
import { JwtPayload } from '../../../domain/value-objects/jwt-payload.vo';
import { Session } from '../../../domain/entities/session.entity';
import { SessionId } from '../../../domain/value-objects/session-id.vo';
import { TokenPair } from '../../../domain/value-objects/token-pair.vo';
import { TokenResponseDto } from '../../dto/response/token-response.dto';

@Injectable()
@CommandHandler(AuthenticateCustomerCommand)
export class AuthenticateCustomerHandler
  implements ICommandHandler<AuthenticateCustomerCommand, TokenResponseDto>
{
  constructor(
    @Inject(CUSTOMER_AUTHENTICATION_SERVICE)
    private readonly customerAuthService: ICustomerAuthenticationService,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
  ) {}

  /**
   * Executes customer authentication returning signed token pair
   */
  async execute(
    command: AuthenticateCustomerCommand,
  ): Promise<TokenResponseDto> {
    const email = Email.create(command.email);

    const customerData =
      await this.customerAuthService.findForAuthentication(email);
    if (!customerData) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const matches = await this.passwordHasher.compare(
      command.password,
      customerData.passwordHash,
    );
    if (!matches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!customerData.isActive) {
      throw new BadRequestException('Customer account is not active');
    }

    const payload = JwtPayload.create({
      sub: customerData.id,
      email: customerData.email,
      roles: ['customer'],
      permissions: [],
      tokenId: randomUUID(),
      userType: 'customer', // Mark as customer for guard differentiation
    });

    return this.issueTokens(payload, command, customerData.id);
  }

  private async issueTokens(
    payload: JwtPayload,
    command: AuthenticateCustomerCommand,
    customerId: string,
  ): Promise<TokenResponseDto> {
    const tokenPair: TokenPair =
      await this.tokenService.issueTokenPair(payload);

    const session = Session.create({
      id: SessionId.create(randomUUID()),
      userId: customerId,
      userType: 'customer',
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
