import { Check, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Message } from "./Message";

@Check(`is_valid_uuid(message_id)`)
@Check(`total_files_count >= 0`)
@Check(`total_size_bytes >= 0`)
@Check(`checksum IS NULL OR is_valid_sha256(checksum)`)
@Check(`receiving_at IS NULL OR created_at IS NULL OR receiving_at >= created_at`)
@Check(`received_at IS NULL OR receiving_at IS NULL OR received_at >= receiving_at`)
@Check(`sending_at IS NULL OR received_at IS NULL OR sending_at >= received_at`)
@Check(`sent_at IS NULL OR sending_at IS NULL OR sent_at >= sending_at`)
@Check(`delivered_at IS NULL OR sent_at IS NULL OR delivered_at >= sent_at`)
@Check(`read_at IS NULL OR delivered_at IS NULL OR read_at >= delivered_at`)
@Entity({ name: `message_ext` })
export class MessageExt {
  @PrimaryGeneratedColumn({ name: `id` })
  id!: number
  @OneToOne(() => Message, msg => msg.id)
  @JoinColumn({ name: `message_id` })
  message!: Message
  @Column(`varchar`, { name: `message_id`, nullable: false, unique: true })
  messageId!: string

  @Column(`timestamp`, { name: `created_at` })
  createdAt!: Date
  @Column(`timestamp`, { name: `receiving_at` })
  receiving_at!: Date
  @Column(`timestamp`, { name: `received_at` })
  received_at!: Date
  @Column(`timestamp`, { name: `sending_at` })
  sending_at !: Date
  @Column(`timestamp`, { name: `sent_at` })
  sent_at !: Date
  @Column(`timestamp`, { name: `delivered_at` })
  delivered_at !: Date
  @Column(`timestamp`, { name: `read_at` })
  read_at !: Date

  @Column(`integer`, { name: `total_files_count`, default: 0 })
  totalFilesCount!: number
  @Column(`bigint`, { name: `total_size_bytes`, default: 0 })
  totalSizeBytes!: number
  @Column(`varchar`, { name: `checksum` })
  checksum !: string
  @Column(`text`, { name: `metadata` })
  metadata!: string
  @Column(`text`, { name: `original_metadata` })
  originalMetadata!: string
}