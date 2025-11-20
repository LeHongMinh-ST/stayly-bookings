import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { HotelRoomOrmEntity } from "./hotel-room.orm-entity";

@Entity({ name: "room_types" })
export class RoomTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "hotel_id", type: "uuid" })
  hotelId: string;

  @Column({ type: "varchar", length: 120 })
  name: string;

  @Column({ type: "varchar", length: 50 })
  category: string;

  @Column({ type: "integer" })
  area: number;

  @Column({ name: "capacity", type: "jsonb" })
  capacity: {
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
  })
  basePriceAmount: number;

  @Column({ name: "base_price_currency", type: "char", length: 3 })
  basePriceCurrency: string;

  @Column({
    name: "view_direction",
    type: "varchar",
    length: 80,
    nullable: true,
  })
  viewDirection: string | null;

  @OneToMany(() => HotelRoomOrmEntity, (room) => room.roomType, {
    cascade: true,
  })
  rooms: HotelRoomOrmEntity[];

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
