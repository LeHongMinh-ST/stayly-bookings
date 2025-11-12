/**
 * AuthenticateUserHandler validates credentials and issues JWT tokens
 */
import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { AuthenticateUserCommand } from '../authenticate-user.command';
import type { IUserRepository } from '../../../../user-management/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../../user-management/domain/repositories/user.repository.interface';
import type { ICustomerRepository } from '../../../../customer-management/domain/repositories/customer.repository.interface';
import { CUSTOMER_REPOSITORY } from '../../../../customer-management/domain/repositories/customer.repository.interface';
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
import { TokenResponseDto } from '../../dto/token-response.dto';
import { User } from '../../../../user-management/domain/entities/user.entity';
import { UserStatus } from '../../../../user-management/domain/value-objects/user-status.vo';
import { Customer } from '../../../../customer-management/domain/entities/customer.entity';
import { CustomerStatus } from '../../../../customer-management/domain/value-objects/customer-status.vo';

@Injectable()
@CommandHandler(AuthenticateUserCommand)
export class AuthenticateUserHandler
  implements ICommandHandler<AuthenticateUserCommand, TokenResponseDto>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
  ) {}

  /**
   * Executes authentication returning signed token pair
   */
  async execute(command: AuthenticateUserCommand): Promise<TokenResponseDto> {
    const email = Email.create(command.email);

    const staffUser = await this.userRepository.findByEmail(email);
    if (staffUser) {
      return this.authenticateStaff(staffUser, command);
    }    

    const customer = await this.customerRepository.findByEmail(email);
    if (customer) {
      return this.authenticateCustomer(customer, command);
    }

    throw new Error('Invalid credentials');
  }

  private async authenticateStaff(
    user: User,
    command: AuthenticateUserCommand,
  ): Promise<TokenResponseDto> {
    const matches = await this.passwordHasher.compare(
      command.password,
      user.getPasswordHash().getValue(),
    );
    if (!matches) {
      throw new Error('Invalid credentials');
    }

    if (user.getStatus().getValue() !== UserStatus.ACTIVE) {
      throw new Error('User is not active');
    }

    const payload = JwtPayload.create({
      sub: user.getId().getValue(),
      email: user.getEmail().getValue(),
      roles: user.getRoles().map((role) => role.getValue()),
      permissions: user.getPermissions().map((permission) => permission.getValue()),
      tokenId: randomUUID(),
    });

    return this.issueTokens(payload, command, user.getId().getValue());
  }

  private async authenticateCustomer(
    customer: Customer,
    command: AuthenticateUserCommand,
  ): Promise<TokenResponseDto> {
    const matches = await this.passwordHasher.compare(
      command.password,
      customer.getPasswordHash().getValue(),
    );
    if (!matches) {
      throw new Error('Invalid credentials');
    }

    if (customer.getStatus().getValue() !== CustomerStatus.ACTIVE) {
      throw new Error('Customer is not active');
    }

    const payload = JwtPayload.create({
      sub: customer.getId().getValue(),
      email: customer.getEmail().getValue(),
      roles: ['customer'],
      permissions: [],
      tokenId: randomUUID(),
    });

    return this.issueTokens(payload, command, customer.getId().getValue());
  }

  private async issueTokens(
    payload: JwtPayload,
    command: AuthenticateUserCommand,
    subjectId: string,
  ): Promise<TokenResponseDto> {
    const tokenPair: TokenPair = await this.tokenService.issueTokenPair(payload);

    const session = Session.create({
      id: randomUUID(),
      userId: subjectId,
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
