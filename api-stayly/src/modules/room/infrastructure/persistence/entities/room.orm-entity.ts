import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "rooms" })
export class RoomOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "accommodation_id", type: "uuid" })
  accommodationId: string;

  @Column({ type: "varchar", length: 120 })
  name: string;

  @Column({ type: "varchar", length: 50 })
  category: string;

  @Column({ type: "integer" })
  area: number;

  @Column({ name: "guest_capacity", type: "jsonb" })
  guestCapacity: {
    maxAdults: number;
    maxChildren: number;
  };

  @Column({ name: "bed_count", type: "integer" })
  bedCount: number;

  @Column({ name: "bed_type", type: "varchar", length: 50 })
  bedType: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "jsonb" })
  amenities: string[];

  @Column({ type: "jsonb" })
  images: Array<{
    url: string;
    type: string;
    order: number;
  }>;

  @Column({ type: "integer" })
  inventory: number;

  @Column({ type: "varchar", length: 20 })
  status: string;

  @Column({
    name: "base_price_amount",
    type: "numeric",
    precision: 12,
    scale: 2,
    nullable: true,
  })
  basePriceAmount: number | null;

  @Column({
    name: "base_price_currency",
    type: "char",
    length: 3,
    nullable: true,
  })
  basePriceCurrency: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
