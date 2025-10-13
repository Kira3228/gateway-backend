import { Check, Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { System } from "./System";


@Check(`encoding IN('utf-8', 'windows-1251', 'iso-8859-1', 'cp1251')`)
@Check(`LENGTH(template_id) > 0`)
@Check(`LENGTH(name) > 0`)
@Check(`LENGTH(regex_pattern) > 10`)
@Check(`version ~ '^[0-9]+\.[0-9]+(\.[0-9]+)?$'`)
@Check(`description IS NULL OR LENGTH(description) > 0`)
@Entity({ name: `metadata_templates` })
export class MetadataTemplate {
  @PrimaryGeneratedColumn({ name: `id` })
  id!: number
  @Column(`varchar`, { name: `template_id`, nullable: false, unique: true })
  templateId!: string
  @Column(`varchar`, { nullable: false, name: `name` })
  name!: string
  @Column(`varchar`, { name: `version`, nullable: false, default: `1.0` })
  version!: string
  @Column(`varchar`, { name: `encoding`, default: `utf-8` })
  encoding!: string
  @Column(`text`, { name: `regex_pattern`, nullable: false })
  regexPattern!: string
  @Column(`varchar`, { name: `regex_flags`, default: `MULTILINE,DOTALL` })
  regexFlags!: string
  @Column(`text`, { name: `field_validation` })
  fieldValidation!: string
  @Column(`boolean`, { default: true, name: `is_active` })
  isActive!: boolean
  @Column(`varchar`, { name: `description` })
  description!: string
  @Column(`timestamp`, { default: () => `CURRENT_TIMESTAMP`, name: `created_at` })
  createdAt!: Date
  @Column(`timestamp`, { default: () => `CURRENT_TIMESTAMP`, name: `updated_at` })
  updatedAt!: Date

  @ManyToOne(() => System, sys => sys.systemCode)
  @JoinColumn({ name: `system_code` })
  system!: System
  @Column(`varchar`, { nullable: false, name: `system_code` })
  systemCode!: string
}