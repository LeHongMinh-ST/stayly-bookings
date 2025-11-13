/**
 * AssignRolesToUserDto validates role assignment updates
 */
import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray } from 'class-validator';

export class AssignRolesToUserDto {
  @ApiProperty({
    description: 'Array of role codes to assign to the user',
    example: ['owner', 'manager'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  roles!: string[];
}

