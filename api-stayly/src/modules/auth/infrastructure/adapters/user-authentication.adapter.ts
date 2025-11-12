/**
 * UserAuthenticationAdapter adapts UserAuthenticationService from user module
 * to IUserAuthenticationService interface for auth module
 * Following Adapter Pattern - adapters use services, not repositories
 * Services are exported from modules and provide what other modules need
 */
import { Inject, Injectable } from '@nestjs/common';
import { Email } from '../../../../common/domain/value-objects/email.vo';
import type { UserAuthenticationService } from '../../../user/infrastructure/services/user-authentication.service';
import { USER_AUTHENTICATION_SERVICE } from '../../../user/infrastructure/services/user-authentication.service';
import type {
  IUserAuthenticationService,
  UserAuthenticationData,
} from '../../application/interfaces/user-authentication.service.interface';

@Injectable()
export class UserAuthenticationAdapter implements IUserAuthenticationService {
  constructor(
    @Inject(USER_AUTHENTICATION_SERVICE)
    private readonly userAuthenticationService: UserAuthenticationService,
  ) {}

  /**
   * Delegates to UserAuthenticationService
   * Adapter uses service, not repository directly
   */
  async findForAuthentication(email: Email): Promise<UserAuthenticationData | null> {
    return this.userAuthenticationService.findForAuthentication(email);
  }
}

