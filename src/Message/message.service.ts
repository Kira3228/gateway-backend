import { inject, injectable, InjectionToken } from "tsyringe";
import { In, Repository, SelectQueryBuilder } from "typeorm";
import { Message } from "../Entities/Message";
import { PaginatedResult } from "../shared/utils/types/common.interface";
import { IMessageFilters } from "./message.interface";
import { paginate } from "../shared/utils/paginate";
import { IDefaultFilters, IHeader } from "../shared/utils/types/IConfig";
import { MessageConfigService, MessageConfigServiceToken } from "./message-config.service";
import { log } from "console";
import { MessageExt } from "../Entities/MessageExt";
import { MessageFile } from "../Entities/MessageFile";
import { MessageStatusHistory } from "../Entities/MessageStatusHistory";
import { FileDto, HistoryDto } from "./dto";
import { IHistoryFilters, IHistorySort } from "./types/IHistoryFilters";
import { arrayParser } from "../shared/utils/arrayParser";
import { IMessageFilesQueryParams } from "./types/IMessageFilesQueryParams";

export const MessageExtRepositoryToken: InjectionToken<Repository<MessageExt>> = "MessageExtRepositoryToken"
export const MessageRepositoryToken: InjectionToken<Repository<Message>> = "MessageRepositoryToken";
export const MessageFileRepositoryToken: InjectionToken<Repository<MessageFile>> = "MessageFileRepositoryToken"
export const MessageStatusHistoryToken: InjectionToken<Repository<MessageStatusHistory>> = "MessageStatusHistoryToken"

@injectable()
export class MessageService {
  constructor(
    @inject(MessageRepositoryToken) private readonly messageRepo: Repository<Message>,
    @inject(MessageExtRepositoryToken) private readonly messageExtRepo: Repository<MessageExt>,
    @inject(MessageConfigServiceToken) private readonly configService: MessageConfigService,
    @inject(MessageFileRepositoryToken) private readonly messageFileRepo: Repository<MessageFile>,
    @inject(MessageStatusHistoryToken) private readonly messageStatusHistoryRepo: Repository<MessageStatusHistory>
  ) { }

  async getAllMessages() {
    const messages = await this.messageRepo.find()
    return messages
  }

  async getHeaders(preset: string): Promise<IHeader[]> {
    return this.configService.getHeaders(preset)
  }

  async getPresetNames(): Promise<string[]> {
    return this.configService.getPresetNames()
  }

  async getFilters(presetName: string): Promise<IDefaultFilters> {
    return this.configService.getFilters(presetName)
  }

  async getExceptions(presetName: string) {
    try {
      const preset = this.configService.getPreset(presetName)
      return preset?.exceptions || {}
    }
    catch (error) {
      console.error(error);
      return {}
    }
  }

  private createBaseQuery(): SelectQueryBuilder<Message> {
    const messages = this.messageRepo.createQueryBuilder(`msg`).select([
      `msg.id`,
      `msg.messageId`,
      'msg.messageType',
      'msg.messageCategory',
      'msg.status',
      'msg.priority',
      'msg.metadataParsed',
      'msg.subject',
      'msg.securityLabel',
      'msg.messageNumber',
      'msg.messageCopies',
      'msg.numberCopy',
      'msg.senderName',
      'msg.createdAt',
      'msg.updatedAt',
      'msg.userFromId',
      'msg.userToId',
      'msg.userOperatorId',
      'msg.targetSystemId',
      'msg.sourceSystemId',
      'msg.pointId',
    ])
    return messages
  }

  private async paginateQuery(qb: SelectQueryBuilder<Message>,
    filters: IMessageFilters
  ): Promise<PaginatedResult<Message>> {
    log(filters)
    const page = Math.max(1, filters.page || 1)
    const limit = Math.min(100, Math.max(1, filters.limit || 30))
    return await paginate(qb, page, limit, `items`)
  }

  async getMessages(filters?: IMessageFilters): Promise<Message[]> {
    try {
      const qb = this.createBaseQuery()
      const messages = qb.getMany()
      const paginate = await this.paginateQuery(qb, filters)
      return messages
    }
    catch (error) {
      console.error(error);
    }
  }

  async getExtendedDataByMsgId(messageId: string) {
    const details = await this.messageExtRepo.findOne({
      where: { message: messageId },
      select: [
        "checksum",
        "createdAt",
        "delivered_at",
        "id",
        "metadata",
        "originalMetadata",
        "read_at",
        "received_at",
        "received_at",
        "receiving_at",
        "sending_at",
        "sent_at",
        "totalFilesCount",
        "totalSizeBytes",
      ]
    })
    return details
  }

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

  async getMessageFilesByQb(_messageId: string, _params: IMessageFilesQueryParams): Promise<MessageFile[]> {
    // const skip = _params.limit * (_params.page - 1)
    const skip = 3
    const orderBy: any = {}
    log(`orderBy:`, orderBy)
    if (_params.createdAtOrder) {
      orderBy['files.created_at'] = _params.createdAtOrder
    }
    if (_params.fileNameOrder) {
      orderBy['files.file_name'] = _params.fileNameOrder
    }
    if (_params.fileSizeBytesOrder) {
      orderBy['files.file_size_bytes'] = _params.fileSizeBytesOrder
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

  async getStatusHistory(
    messageId: number,
    filters: IHistoryFilters,
    _page: number,
    _limit: number
  ) {

    const where: Partial<{
      messageId: number
      oldStatus: any
      newStatus: any
      user: {
        userType: any
      }
    }> = { messageId: messageId, }

    if (filters.oldStatuses && filters.oldStatuses.length > 0) {
      where.oldStatus = In(arrayParser(filters.oldStatuses))
    }

    if (filters.newStatuses && filters.newStatuses.length > 0) {
      where.newStatus = In(arrayParser(filters.newStatuses))
    }

    if (filters.userTypes && filters.userTypes.length > 0) {
      where.user = {
        userType: In(arrayParser(filters.userTypes))
      }
    }

    const history = await this.messageStatusHistoryRepo.find({
      where: {
        ...where,
      },
      relations: [`user`],
      order: filters.sortField ? { [filters.sortField]: filters.sortOrder ?? "ASC" } : undefined

    })
    return history
  }

  async getHistoryByQb({ _messageId }: { _messageId: number; },): Promise<MessageStatusHistory[]> {
    const qb = this.messageStatusHistoryRepo.createQueryBuilder(`history`)
      .leftJoinAndSelect(`history.user`, 'user').where(`history.messageId = :id`, { id: _messageId })
    const result = await qb.getMany()

    return result
  }


  test(asd: {}) {
    const map: Record<string, string> = {
    }

    const filters = {

    }

    const zxc = {
      "user.fullname": filters[`fullname`],

    }
  }


  async createFiles(dto: FileDto[]) {
    const file = this.messageFileRepo.create(dto)
    await this.messageFileRepo.save(file)
    return file
  }

  async createStatusHistory(dto: HistoryDto[]) {
    const history = this.messageStatusHistoryRepo.create(dto)
    await this.messageStatusHistoryRepo.save(history)
    return history
  }
}