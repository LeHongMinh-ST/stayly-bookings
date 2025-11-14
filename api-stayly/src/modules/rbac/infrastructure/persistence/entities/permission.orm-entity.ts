/**
 * PermissionOrmEntity stores fine-grained permission catalog entries
 */
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import type { UserOrmEntity } from "../../../../user/infrastructure/persistence/entities/user.orm-entity";
import { RoleOrmEntity } from "./role.orm-entity";

@Entity({ name: "permissions" })
export class PermissionOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "code", unique: true })
  code!: string;

  @Column({ name: "description", nullable: true, type: "text" })
  description!: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @ManyToMany("UserOrmEntity", "permissions")
  users!: UserOrmEntity[];

  @ManyToMany(() => RoleOrmEntity, (role) => role.permissions)
  roles!: RoleOrmEntity[];
}
