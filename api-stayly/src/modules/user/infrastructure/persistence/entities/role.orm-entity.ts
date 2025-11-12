/**
 * RoleOrmEntity persists RBAC role catalog
 */
import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';

@Entity({ name: 'roles' })
export class RoleOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'code', unique: true })
  code!: string;

  @Column({ name: 'display_name' })
  displayName!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToMany(() => UserOrmEntity, (user) => user.roles)
  users!: UserOrmEntity[];
}
