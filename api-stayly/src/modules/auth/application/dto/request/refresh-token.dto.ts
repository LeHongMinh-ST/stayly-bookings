/**
 * RefreshTokenDto validates refresh token payload
 */
import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class RefreshTokenDto {
  @ApiProperty({
    description: "Refresh token for obtaining new access token",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    minLength: 20,
  })
  @IsString()
  @MinLength(20)
  refreshToken!: string;
}
