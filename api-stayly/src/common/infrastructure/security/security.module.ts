/**
 * SecurityModule centralizes reusable security providers
 */
import { Module } from '@nestjs/common';
import { BcryptPasswordHasherService } from './bcrypt-password-hasher.service';
import { PASSWORD_HASHER } from '../../application/interfaces/password-hasher.interface';

@Module({
  providers: [
    BcryptPasswordHasherService,
    { provide: PASSWORD_HASHER, useExisting: BcryptPasswordHasherService },
  ],
  exports: [PASSWORD_HASHER, BcryptPasswordHasherService],
})
export class SecurityModule {}
