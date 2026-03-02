export class MessageExportDto {
  presetName?: string
  invisibleFieldsIsAvailable: "true" | "false"
  priority?: [number, number]
  metadata?: boolean
  createDateRange?: [string, string]
  updateDateRange?: [string, string]
  categories?: string
  messageTypes?: string
  statuses?: string
  securityLabels?: string
}