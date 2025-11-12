/**
 * IUserRepository declares persistence operations for user aggregate
 */
import { User } from '../entities/user.entity';
import { UserId } from '../value-objects/user-id.vo';
import { Email } from '../../../../common/domain/value-objects/email.vo';

export interface IUserRepository {
  save(user: User): Promise<void>;
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findMany(limit: number, offset: number): Promise<User[]>;
  count(): Promise<number>;
}

export const USER_REPOSITORY = 'USER_REPOSITORY';
