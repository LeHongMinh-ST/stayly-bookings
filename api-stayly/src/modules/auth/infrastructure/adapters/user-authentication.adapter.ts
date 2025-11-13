/**
 * UserAuthenticationAdapter adapts IUserAuthenticationPort from user module
 * to IUserAuthenticationService interface for auth module
 * 
 * Following Port/Adapter Pattern:
 * - Port (interface) is defined in user module application layer
 * - Adapter is in infrastructure layer, so it CAN import from other modules
 * - Application layer only depends on interface, not this adapter
 * - Infrastructure layer handles cross-module communication
 */
import { Inject, Injectable } from '@nestjs/common';
import { Email } from '../../../../common/domain/value-objects/email.vo';
import type { IUserAuthenticationPort } from '../../../user/application/interfaces/user-authentication.port';
import { USER_AUTHENTICATION_PORT } from '../../../user/application/interfaces/user-authentication.port';
import type {
  IUserAuthenticationService,
  UserAuthenticationData,
} from '../../application/interfaces/user-authentication.service.interface';

@Injectable()
export class UserAuthenticationAdapter implements IUserAuthenticationService {
  constructor(
    @Inject(USER_AUTHENTICATION_PORT)
    private readonly userAuthenticationPort: IUserAuthenticationPort,
  ) {}

  /**
   * Adapts user module port to auth module interface
   * Infrastructure layer handles the mapping between modules
   */
  async findForAuthentication(email: Email): Promise<UserAuthenticationData | null> {
    return this.userAuthenticationPort.findForAuthentication(email);
  }
}

