import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateRoleDto {
  @ApiProperty({
    description: "Display name for the role",
    example: "Updated Manager Name",
    required: false,
  })
  @IsOptional()
  @IsString()
  displayName?: string;
}
