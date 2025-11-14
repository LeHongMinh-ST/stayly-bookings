/**
 * AssignRolesDto validates role assignment updates
 */
import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray } from "class-validator";

export class AssignRolesDto {
  @ApiProperty({
    description: "Array of role names to assign to the user",
    example: ["OWNER", "MANAGER"],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  roles!: string[];
}
