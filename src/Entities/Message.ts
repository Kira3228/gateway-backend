import { Check, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { MessageTypeEnum } from "./Enums/MessageType.enum";
import { MessageCategoryEnum } from "./Enums/MessageCategory.emum";
import { MessageStatusEnum } from "./Enums/MessageStatus.enum";
import { SecurityLabelEnum } from "./Enums/SecurityLabel.enum";
import { User } from "./User";
import { System } from "./System";
import { Point } from "./Point";
import { MessageStatusHistory } from "./MessageStatusHistory";
import { MessageFile } from "./MessageFile";
import { MessageExt } from "./MessageExt";

// @Check(`is_valid_uuid(message_id)`)
@Check(`priority BETWEEN 1 AND 10`)
@Check(`message_copies > 0`)
@Check(`number_copy > 0 AND number_copy <= message_copies`)
@Check(`subject IS NULL OR LENGTH(subject) > 0`)
@Check(`message_number IS NULL OR LENGTH(message_number) > 0`)
@Check(`sender_number IS NULL OR LENGTH(sender_number) > 0`)
@Entity({ name: `messages` })
export class Message {
  @PrimaryGeneratedColumn({ name: `id` })
  id!: number

  @Column(`varchar`, { name: `message_id`, nullable: false, unique: true })
  messageId!: string

  @Column(`enum`, {
    name: `message_type`,
    enum: MessageTypeEnum,
    enumName: `message_type_enum`,
    nullable: false
  })
  messageType!: MessageTypeEnum
  
  @Column(`enum`, { name: `message_category`, enum: MessageCategoryEnum, enumName: `message_category_enum`, nullable: false })
  messageCategory!: MessageCategoryEnum

  @Column(`enum`, { enum: MessageStatusEnum, enumName: `message_status_enum`, nullable: false, name: `status` })
  status!: MessageStatusEnum

  @Column(`integer`, { default: 5, name: `priority` })
  priority!: number

  @Column(`boolean`, { name: `metadata_parsed`, default: false })
  metadataParsed!: boolean

  @Column(`varchar`, { name: `subject` })
  subject!: string

  @Column(`enum`, { name: `security_label`, enum: SecurityLabelEnum, enumName: `security_label_enum` })
  securityLabel!: SecurityLabelEnum
  
  @Column(`varchar`, { name: `message_number` })
  messageNumber!: string

  @Column(`integer`, { name: `message_copies`, default: 1 })
  messageCopies!: number

  @Column(`integer`, { name: `number_copy`, default: 1 })
  numberCopy!: number

  @Column(`varchar`, { name: `sender_number` })
  senderName!: string

  @Column(`timestamp`, { name: `created_at`, default: () => `CURRENT_TIMESTAMP` })
  createdAt!: Date

  @Column(`timestamp`, { name: `updated_at`, default: () => `CURRENT_TIMESTAMP` })
  updatedAt!: Date

  @ManyToOne(() => User, user => user.id, { nullable: false, onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: `user_from_id` })
  userFrom!: User
  @Column(`bigint`, { nullable: false, name: `user_from_id` })
  userFromId!: number

  @ManyToOne(() => User, user => user.id, { nullable: false, onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: `user_to_id` })
  userTo!: User
  @Column(`bigint`, { name: `user_to_id` })
  userToId!: number

  @ManyToOne(() => User, user => user.id, { nullable: true, onDelete: "SET NULL", onUpdate: "CASCADE" })
  @JoinColumn({ name: `user_operator_id` })
  userOperator!: User
  @Column(`bigint`, { name: `user_operator_id`, nullable: true })
  userOperatorId!: number

  @ManyToOne(() => System, sys => sys.id, { nullable: false, onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: `target_system_id` })
  targetSystem!: System
  @Column(`varchar`, { name: `target_system_id` })
  targetSystemId!: number

  @ManyToOne(() => System, sys => sys.id, { nullable: false, onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: `source_system_id` })
  sourceSystem!: System

  @Column('bigint', { name: 'source_system_id' })
  sourceSystemId!: number

  @ManyToOne(() => Point, point => point.id, { onDelete: "SET NULL", onUpdate: "CASCADE" })
  @JoinColumn({ name: `point_id` })
  point!: Point
  @Column(`bigint`, { name: `point_id` })
  pointId!: number

  @OneToMany(() => MessageStatusHistory, msh => msh.messageId)
  messagStatusHistory!: MessageStatusHistory[]

  @OneToMany(() => MessageFile, file => file.messageId)
  messageFile!: MessageFile[]

  @OneToOne(() => MessageExt, msgext => msgext.message)
  messageExt!: number
}