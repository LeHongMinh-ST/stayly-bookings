import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { RoomTypeOrmEntity } from "./room-type.orm-entity";

@Entity({ name: "hotel_rooms" })
export class HotelRoomOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "room_type_id", type: "uuid" })
  roomTypeId: string;

  @ManyToOne(() => RoomTypeOrmEntity, (roomType) => roomType.rooms, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "room_type_id" })
  roomType: RoomTypeOrmEntity;

  @Column({ name: "room_number", type: "varchar", length: 32 })
  roomNumber: string;

  @Column({ name: "floor_id", type: "uuid", nullable: true })
  floorId: string | null;

  @Column({ type: "varchar", length: 20 })
  status: string;

  @Column({ type: "text", nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
