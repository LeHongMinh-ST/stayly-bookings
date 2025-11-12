/**
 * AssignRolesDto validates role assignment updates
 */
import { ArrayNotEmpty, IsArray } from 'class-validator';

export class AssignRolesDto {
  @IsArray()
  @ArrayNotEmpty()
  roles!: string[];
}
