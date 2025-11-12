/**
 * Email value object encapsulates email validation logic
 */
export class Email {
  private constructor(private readonly value: string) {}

  static create(value: string): Email {
    const trimmed = value?.trim().toLowerCase();
    if (!trimmed) {
      throw new Error('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      throw new Error(`Invalid email format: ${trimmed}`);
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
