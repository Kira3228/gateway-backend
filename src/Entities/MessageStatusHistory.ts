import { Check, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MessageStatusEnum } from "./Enums/MessageStatus.enum";
import { User } from "./User";
import { Message } from "./Message";

@Check(`reason IS NULL OR LENGTH(reason) > 0`)
@Check(`change_datetime IS NOT NULL`)
@Entity({ name: `message_status_history` })
export class MessageStatusHistory {
  @PrimaryGeneratedColumn({ name: `id` })
  id!: number

  @Column(`enum`, { name: `old_status`, enum: MessageStatusEnum, enumName: `message_status_enum`, nullable: true })
  oldStatus!: MessageStatusEnum

  @Column(`enum`, { name: `new_status`, enum: MessageStatusEnum, enumName: `message_status_enum`, nullable: false })
  newStatus!: MessageStatusEnum

  @Column(`varchar`, { name: `reason` })
  reason!: string

  @Column(`timestamp`, {
    name: `change_datetime`, default: () => `CURRENT_TIMESTAMP`
  })
  changeDatetime!: Date

  @Column(`text`, { name: `metadata` })
  metadata!: string

  @ManyToOne(() => Message, msg => msg.id, { onDelete: "CASCADE", onUpdate: `CASCADE` })
  @JoinColumn({ name: `message_id` })
  message!: Message
  @Column(`bigint`, { nullable: false, name: `message_id` })
  messageId!: number

  @ManyToOne(() => User, user => user.id, { onDelete: "SET NULL", onUpdate: "CASCADE" })
  @JoinColumn({ name: `changed_by_user_id` })
  user!: User
  @Column(`bigint`, { name: `changed_by_user_id` })
  changedByUserId!: number
} 