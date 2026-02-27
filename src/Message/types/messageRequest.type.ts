export interface MessageRequestQuery {
  page?: number
  limit?: number,
  presetName?: string
  priority?: [number | null, number | null]
  metadata?: boolean | null
  createDateRange?: [string | null, string | null]
  updateDateRange?: [string | null, string | null]
  categories?: string
  messageTypes?: string
  statuses?: string
  securityLabels?: string
}
