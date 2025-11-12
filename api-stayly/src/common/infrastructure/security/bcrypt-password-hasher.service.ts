/**
 * BcryptPasswordHasher hashes and verifies passwords using bcrypt
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PasswordHasher } from '../../application/interfaces/password-hasher.interface';

@Injectable()
export class BcryptPasswordHasherService implements PasswordHasher {
  private readonly saltRounds: number;

  constructor(private readonly configService: ConfigService) {
    this.saltRounds = this.configService.get<number>('security.bcryptSaltRounds', 12);
  }

  /**
   * Hashes plaintext password using bcrypt with configured salt rounds
   */
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.saltRounds);
  }

  /**
   * Compares plaintext with stored hash
   */
  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
