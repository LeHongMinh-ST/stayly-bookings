/**
 * UserOrmEntity maps user aggregate to relational storage
 */
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RoleOrmEntity } from './role.orm-entity';
import { PermissionOrmEntity } from './permission.orm-entity';

@Entity({ name: 'users' })
export class UserOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'email', unique: true })
  email!: string;

  @Column({ name: 'full_name' })
  fullName!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ name: 'status', default: 'active' })
  status!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToMany(() => RoleOrmEntity, (role) => role.users, { cascade: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles!: RoleOrmEntity[];

  @ManyToMany(() => PermissionOrmEntity, (permission) => permission.users, {
    cascade: true,
  })
  @JoinTable({
    name: 'user_permissions',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions!: PermissionOrmEntity[];
}
