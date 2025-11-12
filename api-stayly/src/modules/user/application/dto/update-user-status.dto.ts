/**
 * UpdateUserStatusDto validates incoming status change payload
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserStatus } from '../../domain/value-objects/user-status.vo';

export class UpdateUserStatusDto {
  @ApiProperty({
    description: 'New user status',
    example: UserStatus.ACTIVE,
    enum: UserStatus,
  })
  @IsEnum(UserStatus)
  status!: UserStatus;
}
