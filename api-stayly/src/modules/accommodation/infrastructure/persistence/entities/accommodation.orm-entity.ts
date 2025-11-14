/**
 * AccommodationOrmEntity
 * TypeORM entity for Accommodation aggregate
 * Uses Single Table Inheritance pattern
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { AccommodationType } from "../../../domain/entities/accommodation.entity";
import { AccommodationStatus } from "../../../domain/value-objects/accommodation-status.vo";

@Entity("accommodations")
export class AccommodationOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 20 })
  type: AccommodationType;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 50 })
  status: AccommodationStatus;

  @Column({ name: "owner_id", type: "uuid" })
  ownerId: string;

  // Address fields
  @Column({ type: "varchar", length: 255 })
  street: string;

  @Column({ type: "varchar", length: 100 })
  ward: string;

  @Column({ type: "varchar", length: 100 })
  district: string;

  @Column({ type: "varchar", length: 100 })
  province: string;

  @Column({ type: "varchar", length: 100 })
  country: string;

  // Location fields
  @Column({ type: "decimal", precision: 10, scale: 8 })
  latitude: number;

  @Column({ type: "decimal", precision: 11, scale: 8 })
  longitude: number;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "jsonb" })
  images: string[];

  @Column({ type: "jsonb" })
  amenities: string[];

  // Policies fields
  @Column({ name: "check_in_time", type: "varchar", length: 10 })
  checkInTime: string;

  @Column({ name: "check_out_time", type: "varchar", length: 10 })
  checkOutTime: string;

  @Column({ name: "children_allowed", type: "boolean", default: false })
  childrenAllowed: boolean;

  @Column({ name: "pets_allowed", type: "boolean", default: false })
  petsAllowed: boolean;

  @Column({ name: "smoking_allowed", type: "boolean", default: false })
  smokingAllowed: boolean;

  // Cancellation policy fields
  @Column({ name: "cancellation_policy_type", type: "varchar", length: 50 })
  cancellationPolicyType: string;

  @Column({
    name: "free_cancellation_days",
    type: "integer",
    default: 0,
  })
  freeCancellationDays: number;

  @Column({
    name: "refund_percentage",
    type: "integer",
    default: 100,
  })
  refundPercentage: number;

  // Approval fields
  @Column({ name: "approved_by", type: "uuid", nullable: true })
  approvedBy: string | null;

  @Column({ name: "approved_at", type: "timestamp", nullable: true })
  approvedAt: Date | null;

  // Hotel-specific fields (nullable for homestay)
  @Column({ name: "star_rating", type: "integer", nullable: true })
  starRating: number | null;

  @Column({ name: "total_floors", type: "integer", nullable: true })
  totalFloors: number | null;

  @Column({ name: "total_rooms", type: "integer", nullable: true })
  totalRooms: number | null;

  @Column({ name: "year_built", type: "integer", nullable: true })
  yearBuilt: number | null;

  @Column({ name: "year_renovated", type: "integer", nullable: true })
  yearRenovated: number | null;

  @Column({
    name: "contact_phone",
    type: "varchar",
    length: 20,
    nullable: true,
  })
  contactPhone: string | null;

  @Column({
    name: "contact_email",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  contactEmail: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  website: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
