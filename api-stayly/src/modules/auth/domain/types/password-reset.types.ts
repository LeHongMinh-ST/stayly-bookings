/**
 * Distinct types shared across password reset domain components
 */
export type PasswordResetSubjectType = "user" | "customer";

export type PasswordResetStatus =
  | "pending"
  | "otp_verified"
  | "completed"
  | "expired"
  | "revoked";
