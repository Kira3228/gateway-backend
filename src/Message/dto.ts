import { MessageStatusEnum } from "../Entities/Enums/MessageStatus.enum"

export class FileDto {
  id: number
  fileName: string
  filePath: string
  fileType: string
  fileSizeBytes: number
  checksum: string
  mimeType: string
  fileOrder: number
  description: string
  isMetadataFile: boolean
  created_at: Date
}

export class HistoryDto {
  oldStatus: MessageStatusEnum
  newStatus: MessageStatusEnum
  reason: string
  changeDatetime: Date
  metadata: string
  changedByUserId: number
}