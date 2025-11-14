/**
 * BcryptPasswordHasher hashes and verifies passwords using bcrypt
 */
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import bcryptModule from "bcrypt";
import { PasswordHasher } from "../../application/interfaces/password-hasher.interface";

type HashFunction = (
  data: string,
  saltOrRounds: string | number,
) => Promise<string>;
type CompareFunction = (data: string, encrypted: string) => Promise<boolean>;

type BcryptModule = {
  hash: HashFunction;
  compare: CompareFunction;
};

const bcrypt = bcryptModule as unknown as BcryptModule;
const hashAsync: HashFunction = (plain, saltOrRounds) =>
  bcrypt.hash(plain, saltOrRounds);
const compareAsync: CompareFunction = (plain, hash) =>
  bcrypt.compare(plain, hash);

@Injectable()
export class BcryptPasswordHasherService implements PasswordHasher {
  private readonly saltRounds: number;

  constructor(private readonly configService: ConfigService) {
    this.saltRounds = this.configService.get<number>(
      "security.bcryptSaltRounds",
      12,
    );
  }

  /**
   * Hashes plaintext password using bcrypt with configured salt rounds
   */
  hash(plain: string): Promise<string> {
    return hashAsync(plain, this.saltRounds);
  }

  /**
   * Compares plaintext with stored hash
   */
  compare(plain: string, hash: string): Promise<boolean> {
    return compareAsync(plain, hash);
  }
}
