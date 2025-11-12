/**
 * PermissionOrmEntity stores fine-grained permission catalog entries
 */
import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';

@Entity({ name: 'permissions' })
export class PermissionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'code', unique: true })
  code!: string;

  @Column({ name: 'description', nullable: true, type: 'text' })
  description!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToMany(() => UserOrmEntity, (user) => user.permissions)
  users!: UserOrmEntity[];
}
