import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

/**
 * ForgotPasswordRequestDto captures email input for reset initiation
 */
export class ForgotPasswordRequestDto {
  @ApiProperty({
    description: "Account email address",
    example: "admin@stayly.io",
  })
  @IsEmail()
  email!: string;
}
