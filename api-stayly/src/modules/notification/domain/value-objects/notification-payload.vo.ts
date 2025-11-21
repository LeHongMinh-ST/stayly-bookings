/**
 * NotificationPayload encapsulates template variables for rendering notifications
 */
export class NotificationPayload {
  private constructor(private readonly value: Record<string, unknown>) {}

  static create(value: Record<string, unknown>): NotificationPayload {
    return new NotificationPayload({ ...value });
  }

  toJSON(): Record<string, unknown> {
    return { ...this.value };
  }
}
