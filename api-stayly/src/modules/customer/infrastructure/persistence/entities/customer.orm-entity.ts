/**
 * CustomerOrmEntity maps customer aggregate to persistence schema
 */
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "customers" })
export class CustomerOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "email", unique: true })
  email!: string;

  @Column({ name: "full_name" })
  fullName!: string;

  @Column({ name: "password_hash" })
  passwordHash!: string;

  @Column({ name: "phone", type: "varchar", nullable: true })
  phone!: string | null;

  @Column({ name: "date_of_birth", type: "date", nullable: true })
  dateOfBirth!: Date | null;

  @Column({ name: "status", type: "varchar", default: "active" })
  status!: string;

  @Column({ name: "email_verified_at", type: "timestamp", nullable: true })
  emailVerifiedAt!: Date | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
