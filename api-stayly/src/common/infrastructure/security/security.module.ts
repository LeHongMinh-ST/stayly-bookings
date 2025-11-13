/**
 * SecurityModule centralizes reusable security providers
 */
import { Module, forwardRef } from '@nestjs/common';
import { BcryptPasswordHasherService } from './bcrypt-password-hasher.service';
import { PASSWORD_HASHER } from '../../application/interfaces/password-hasher.interface';
import { RbacModule } from '../../../modules/rbac/rbac.module';
import { ROLE_REPOSITORY } from '../../../modules/rbac/domain/repositories/role.repository.interface';

@Module({
  imports: [
    forwardRef(() => RbacModule), // Import RbacModule to access ROLE_REPOSITORY
  ],
  providers: [
    BcryptPasswordHasherService,
    { provide: PASSWORD_HASHER, useExisting: BcryptPasswordHasherService },
  ],
  exports: [
    PASSWORD_HASHER,
    BcryptPasswordHasherService,
    ROLE_REPOSITORY, // Export ROLE_REPOSITORY for guards to use
  ],
})
export class SecurityModule {}
