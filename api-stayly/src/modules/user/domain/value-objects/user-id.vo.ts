/**
 * UserId value object wraps UUID validation for user aggregate identifiers
 */
export class UserId {
  private constructor(private readonly value: string) {}

  static create(value: string): UserId {
    const uuidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    if (!uuidRegex.test(value)) {
      throw new Error('UserId must be a valid UUID');
    }
    return new UserId(value);
  }

  getValue(): string {
    return this.value;
  }
}
