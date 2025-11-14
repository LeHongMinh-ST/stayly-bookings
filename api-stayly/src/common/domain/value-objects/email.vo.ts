import { InvalidInputError } from '../errors';

/**
 * Email value object encapsulates email validation logic
 */
export class Email {
  private constructor(private readonly value: string) {}

  static create(value: string): Email {
    const trimmed = value?.trim().toLowerCase();
    if (!trimmed) {
      throw new InvalidInputError('Email is required', 'email');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      throw new InvalidInputError(`Invalid email format: ${trimmed}`);
    }

    return new Email(trimmed);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  getValue(): string {
    return this.value;
  }
}
