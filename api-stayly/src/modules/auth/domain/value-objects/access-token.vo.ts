/**
 * AccessToken value object wraps JWT string to enforce minimal validation
 */
import { InvalidInputError } from "../../../../common/domain/errors";

export class AccessToken {
  private constructor(
    private readonly value: string,
    private readonly expiresInSeconds: number,
  ) {}

  static create(value: string, expiresInSeconds: number): AccessToken {
    if (!value || value.length < 20) {
      throw new InvalidInputError(
        "Access token must be at least 20 characters",
        "accessToken",
        value,
      );
    }
    if (expiresInSeconds <= 0) {
      throw new InvalidInputError(
        "Access token expiry must be positive",
        "expiresInSeconds",
        expiresInSeconds,
      );
    }
    return new AccessToken(value, expiresInSeconds);
  }

  getValue(): string {
    return this.value;
  }

  getExpiresInSeconds(): number {
    return this.expiresInSeconds;
  }
}
