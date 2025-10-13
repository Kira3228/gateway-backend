import { Check, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { ProtocolTypeEnum } from './Enums/ProtocolType.enum'
import { Message } from './Message'
import { MetadataTemplate } from './MetadataTemplate'

@Check(`LENGTH(system_code) > 0`)
@Check(`LENGTH(system_name) > 0`)
@Entity({ name: `systems` })
export class System {
  @PrimaryGeneratedColumn({ name: `id` })
  id!: number
  @Column(`varchar`, { unique: true, nullable: false, name: `system_code` })
  systemCode!: string
  @Column(`varchar`, {
    nullable: false,
    name: `system_name`
  })
  systemName!: string
  @Column(`enum`, {
    enum: ProtocolTypeEnum,
    nullable: false,
    name: `protocol_type`,
    enumName: ``
  })
  protocloType!: ProtocolTypeEnum
  @Column(`text`, { name: `metadata` })
  metadata!: string
  @Column(`boolean`, { default: true, name: `is_active` })
  isActive!: boolean
  @Column(`timestamp`, {
    default: () => `CURRENT_TIMESTAMP`,
    name: `created_at`
  })
  createdAt!: Date
  @Column(`timestamp`, { name: `updated_at`, default: () => `CURRENT_TIMESTAMP` })
  updatedAt!: Date

  @OneToMany(() => Message, msg => msg.sourceSystemId)
  sourseSystemId!: Message[]

  @OneToMany(() => Message, msg => msg.targetSystemId)
  targetSystemId!: Message[]

  @OneToMany(() => MetadataTemplate, mdt => mdt.systemCode)
  metadataTemplate!: MetadataTemplate[]

}

