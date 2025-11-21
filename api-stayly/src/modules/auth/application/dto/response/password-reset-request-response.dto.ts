import { ApiProperty } from "@nestjs/swagger";

/**
 * PasswordResetRequestResponseDto conveys identifiers/timing back to client
 */
export class PasswordResetRequestResponseDto {
  @ApiProperty({
    description: "Identifier for OTP verification and token reset flow",
    format: "uuid",
  })
  readonly requestId: string;

  @ApiProperty({
    description: "Timestamp when reset token expires",
    type: String,
    format: "date-time",
  })
  readonly expiresAt: Date;

  @ApiProperty({
    description: "Timestamp when OTP expires",
    type: String,
    format: "date-time",
  })
  readonly otpExpiresAt: Date;

  constructor(requestId: string, expiresAt: Date, otpExpiresAt: Date) {
    this.requestId = requestId;
    this.expiresAt = expiresAt;
    this.otpExpiresAt = otpExpiresAt;
  }
}
