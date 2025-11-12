import { Email } from "../email.vo";

describe('Email value object', () => {
  it('normalizes valid email addresses', () => {
    const email = Email.create('Test@Example.com');
    expect(email.getValue()).toBe('test@example.com');
  });

  it('throws for invalid email addresses', () => {
    expect(() => Email.create('invalid-email')).toThrow(/Invalid email format/);
  });
});
