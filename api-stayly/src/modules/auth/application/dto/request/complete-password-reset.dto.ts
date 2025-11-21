import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID, MinLength } from "class-validator";

/**
 * CompletePasswordResetDto validates new password submission via reset token
 */
export class CompletePasswordResetDto {
  @ApiProperty({
    description: "Password reset request identifier",
    format: "uuid",
  })
  @IsUUID()
  requestId!: string;

  @ApiProperty({
    description: "Reset token delivered in email link",
    example: "d6fb9b0c0d0d4fe5a0c4a3d2b1c9e8f7",
  })
  @IsString()
  @MinLength(32)
  token!: string;

  @ApiProperty({
    description: "New password that meets policy requirements",
    example: "SecurePassword123!",
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
