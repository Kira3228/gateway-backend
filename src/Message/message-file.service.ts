import { inject, injectable, InjectionToken } from "tsyringe";
import { MessageFile } from "../Entities";
import { Repository } from "typeorm";
import { MessageFilesRequestQuery } from "./types";
import { FileDto } from "./dto";

export const MessageFileRepositoryToken: InjectionToken<Repository<MessageFile>> = "MessageFileServiceRepositoryToken"
export const MessageFileServiceToken: InjectionToken<MessageFileService> = "MessageFileServiceToken"

@injectable()
export class MessageFileService {
  constructor(
    @inject(MessageFileRepositoryToken) private readonly messageFileRepo: Repository<MessageFile>
  ) { }

  async getMessageFile(messageId: string, sortField?: string, sortOrder?: "ASC" | "DESC"): Promise<MessageFile[]> {
    const files = await this.messageFileRepo.find({
      where: {
        messageId: messageId,
      },
      select: [
        "checksum", "created_at", "description", "fileName", "fileOrder", "filePath", "fileSizeBytes", "fileType", "isMetadataFile", "mimeType", "id", "messageId",
      ],
      order: sortField ? { [sortField]: sortOrder ?? "ASC" } : undefined
    })
    return files
  }

  async getMessageFilesByQb(_messageId: string, query: MessageFilesRequestQuery): Promise<MessageFile[]> {
    const skip = query.limit * (query.page - 1)
    const orderBy: any = {}
    if (query.createdAtOrder) {
      orderBy['files.created_at'] = query.createdAtOrder
    }
    if (query.fileNameOrder) {
      orderBy['files.file_name'] = query.fileNameOrder
    }
    if (query.fileSizeBytesOrder) {
      orderBy['files.file_size_bytes'] = query.fileSizeBytesOrder
    }
    const qb = this.messageFileRepo
      .createQueryBuilder(`files`)
      .skip(skip)
      .take(30)
      .where(`files.messageId = :messageId`, { messageId: _messageId })
      .orderBy(orderBy)

    const result = await qb.getMany()
    return result
  }

  async createFiles(dto: FileDto[]) {
    const file = this.messageFileRepo.create(dto)
    await this.messageFileRepo.save(file)
    return file
  }
}