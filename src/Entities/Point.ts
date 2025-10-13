import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Message } from "./Message";

@Entity({ name: `points` })
export class Point {
  @PrimaryGeneratedColumn({ name: `id` })
  id!: number
  @Column(`text`, { unique: true, name: `point_code` })
  pointCode!: string
  @Column(`text`, { nullable: false, name: `point_name` })
  pointName!: string
  @Column(`text`, { name: `location` })
  location!: string
  @Column(`boolean`, { default: true, name: `is_active` })
  isActive!: boolean
  @Column(`text`, { name: `metadata` })
  metadata!: string
  @Column(`timestamp`, { name: `created_at`, default: () => `CURRENT_TIMESTAMP` })
  createdAt!: Date
  @Column(`timestamp`, { name: `updated_at`, default: () => `CURRENT_TIMESTAMP` })
  updatedAt!: Date

  @OneToMany(() => Message, msg => msg.pointId)
  message!: Message[]
}