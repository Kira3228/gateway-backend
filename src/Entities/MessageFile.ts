import { Check, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Message } from "./Message";

@Check(`LENGTH(file_name) > 0`)
@Check(`LENGTH(file_path) > 0`)
@Check(`file_size_bytes >= 0`)
@Check(`file_order >= 0`)
@Check(`checksum IS NULL OR is_valid_sha256(checksum)`)
@Check(`file_type IS NULL OR LENGTH(file_type) > 0`)
@Check(`mime_type IS NULL OR LENGTH(mime_type) > 0`)
@Check(`description IS NULL OR LENGTH(description) > 0`)
@Entity({ name: `message_files` })
export class MessageFile {
  @PrimaryGeneratedColumn({ name: `id` })
  id!: number

  @ManyToOne(() => Message, msg => msg.id, { onDelete: "CASCADE", onUpdate: `CASCADE` })
  @JoinColumn({ name: `message_id` })
  message!: Message
  @Column(`bigint`, { name: `message_id`, nullable: false })
  messageId!: number

  @Column(`varchar`, { name: `file_name`, nullable: false, })
  fileName!: string
  @Column(`varchar`, { nullable: false, name: `file_path` })
  filePath!: string
  @Column(`varchar`, { name: `file_type` })
  fileType!: string
  @Column(`bigint`, { name: `file_size_bytes`, nullable: false })
  fileSizeBytes!: number
  @Column(`varchar`, { name: `checksum` })
  checksum!: string
  @Column(`varchar`, { name: `mime_type` })
  memeType!: string
  @Column(`integer`, { name: `file_order`, default: 0 })
  fileOrder!: number
  @Column(`varchar`, { name: `description` })
  description!: string
  @Column(`boolean`, { name: `is_metadata_file`, default: false })
  isMetadataFile!: boolean
  @Column(`timestamp`, { name: `created_at`, default: () => `CURRENT_TIMESTAMP` })
  created_at!: Date
} 