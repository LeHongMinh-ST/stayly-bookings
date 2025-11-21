/**
 * PasswordResetUtil centralizes helper methods for OTP/token generation
 */
import { createHash, randomBytes, randomInt } from "crypto";

export class PasswordResetUtil {
  /**
   * Generates cryptographically secure token string
   */
  static generateToken(bytes: number = 48): string {
    return randomBytes(bytes).toString("hex");
  }

  /**
   * Generates zero-padded numeric OTP
   */
  static generateOtp(length: number = 6): string {
    const upperBound = 10 ** length;
    return randomInt(0, upperBound).toString().padStart(length, "0");
  }

  /**
   * Hashes secret using SHA-256 for deterministic comparison storage
   */
  static hashSecret(secret: string): string {
    return createHash("sha256").update(secret).digest("hex");
  }
}
