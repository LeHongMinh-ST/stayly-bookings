/**
 * UpdateUserStatusDto validates incoming status change payload
 */
import { IsEnum } from 'class-validator';
import { UserStatus } from '../../domain/value-objects/user-status.vo';

export class UpdateUserStatusDto {
  @IsEnum(UserStatus)
  status!: UserStatus;
}
