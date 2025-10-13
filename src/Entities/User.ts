import { Check, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserTypeEnum } from "./Enums/UserType.enum";
import { Message } from "./Message";
import { MessageStatusHistory } from "./MessageStatusHistory";

@Check(`LENGTH(username) > 0`)
@Check(`full_name IS NULL OR LENGTH(full_name) > 0`)
@Entity({ name: `users` })
export class User {
  @PrimaryGeneratedColumn(`increment`,{ name: `id` })
  id!: number
  @Column(`varchar`, { nullable: false, unique: true, name: `username` })
  userName!: string
  @Column(`varchar`, { name: `full_name` })
  fullName!: string
  @Column(`enum`, { nullable: false, enum: UserTypeEnum, enumName: `user_type_enum`, name: `user_type` })
  userType!: UserTypeEnum
  @Column(`boolean`, { default: true, name: `is_active` })
  isActive!: boolean
  @Column(`timestamp`, { name: `created_at`, default: () => `CURRENT_TIMESTAMP` })
  createdAt!: Date
  @Column(`timestamp`, { name: `updated_at`, default: () => `CURRENT_TIMESTAMP` })
  updatedAt!: Date
  @OneToMany(() => Message, message => message.userFromId)
  messagesFromUser!: Message[]
  @OneToMany(() => Message, message => message.userToId)
  messagesToUser!: Message[]
  @OneToMany(() => Message, message => message.userOperatorId)
  messagesUserOperator!: Message[]
  @OneToMany(() => MessageStatusHistory, msh => msh.changedByUserId)
  messageStatusHistory!: MessageStatusHistory[]
}