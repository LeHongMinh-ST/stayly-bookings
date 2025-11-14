/**
 * CreateUserDto validates inbound request payload for creating users
 */
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class CreateUserDto {
  @ApiProperty({
    description: "User email address",
    example: "admin@stayly.com",
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: "User password (minimum 8 characters)",
    example: "SecurePassword123!",
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({
    description: "User full name",
    example: "John Doe",
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  fullName!: string;
}
