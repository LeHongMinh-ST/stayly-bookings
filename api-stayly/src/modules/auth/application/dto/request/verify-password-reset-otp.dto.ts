import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID, Matches } from "class-validator";

/**
 * VerifyPasswordResetOtpDto validates OTP submission payload
 */
export class VerifyPasswordResetOtpDto {
  @ApiProperty({
    description: "Password reset request identifier",
    format: "uuid",
  })
  @IsUUID()
  requestId!: string;

  @ApiProperty({
    description: "One-time password sent via email",
    example: "123456",
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @Matches(/^\d{6}$/, {
    message: "OTP must contain 6 digits",
  })
  otp!: string;
}
