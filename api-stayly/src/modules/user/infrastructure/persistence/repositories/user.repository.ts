/**
 * UserRepository provides TypeORM implementation of IUserRepository
 */
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { IUserRepository } from "../../../domain/repositories/user.repository.interface";
import { User } from "../../../domain/entities/user.entity";
import { UserId } from "../../../domain/value-objects/user-id.vo";
import { Email } from "../../../../../common/domain/value-objects/email.vo";
import { UserOrmEntity } from "../entities/user.orm-entity";
import { UserOrmMapper } from "../mappers/user.mapper";

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,
  ) {}

  /**
   * Persists aggregate state using upsert semantics
   */
  async save(user: User): Promise<void> {
    const existing = await this.userRepo.findOne({
      where: { id: user.getId().getValue() },
    });

    const entity = UserOrmMapper.toOrm(user, existing ?? undefined);
    await this.userRepo.save(entity);
  }

  async findById(id: UserId): Promise<User | null> {
    const entity = await this.userRepo.findOne({
      where: { id: id.getValue() },
    });
    return entity ? UserOrmMapper.toDomain(entity) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const entity = await this.userRepo.findOne({
      where: { email: email.getValue() },
    });
    return entity ? UserOrmMapper.toDomain(entity) : null;
  }

  async findMany(limit: number, offset: number): Promise<User[]> {
    const entities = await this.userRepo.find({
      take: limit,
      skip: offset,
      order: { createdAt: "DESC" },
    });
    return entities.map((entity) => UserOrmMapper.toDomain(entity));
  }

  async count(): Promise<number> {
    return this.userRepo.count();
  }
}
