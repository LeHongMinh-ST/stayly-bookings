import { InvalidInputError } from "../errors";

/**
 * PasswordHash value object represents a hashed password string
 */
export class PasswordHash {
  private constructor(private readonly value: string) {}

  static create(value: string): PasswordHash {
    if (!value || value.length < 20) {
      throw new InvalidInputError(
        "Password hash must be at least 20 characters",
        "passwordHash",
      );
    }
    return new PasswordHash(value);
  }

  getValue(): string {
    return this.value;
  }
}
