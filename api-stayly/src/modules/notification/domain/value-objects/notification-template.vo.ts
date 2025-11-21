/**
 * NotificationTemplateKey represents logical template names (password_reset, booking_confirmed, etc.)
 */
export class NotificationTemplateKey {
  private constructor(private readonly value: string) {}

  static create(value: string): NotificationTemplateKey {
    if (!value?.trim()) {
      throw new Error("Template key is required");
    }
    return new NotificationTemplateKey(value.trim());
  }

  getValue(): string {
    return this.value;
  }
}
