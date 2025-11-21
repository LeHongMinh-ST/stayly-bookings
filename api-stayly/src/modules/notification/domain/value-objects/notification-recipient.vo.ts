/**
 * NotificationRecipient stores destination details for a notification
 */
export class NotificationRecipient {
  constructor(
    public readonly email?: string | null,
    public readonly phone?: string | null,
    public readonly displayName?: string | null,
  ) {}

  static email(recipient: { email: string; displayName?: string | null }) {
    return new NotificationRecipient(
      recipient.email,
      null,
      recipient.displayName ?? null,
    );
  }
}
