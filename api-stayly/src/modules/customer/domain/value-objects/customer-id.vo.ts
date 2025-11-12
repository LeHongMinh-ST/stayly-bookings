/**
 * CustomerId value object validates UUID identifiers for the customer aggregate
 */
export class CustomerId {
  private constructor(private readonly value: string) {}

  static create(value: string): CustomerId {
    const uuidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    if (!uuidRegex.test(value)) {
      throw new Error('CustomerId must be a valid UUID');
    }
    return new CustomerId(value);
  }

  getValue(): string {
    return this.value;
  }
}
