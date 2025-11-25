import { inject, injectable, InjectionToken } from "tsyringe";
import { Repository, } from "typeorm";
import { Message } from "../Entities/Message";
import { IDefaultFilters, IHeader } from "../shared/utils/types/IConfig";
import { MessageConfigService, MessageConfigServiceToken } from "./message-config.service";
import { MessageExt } from "../Entities/MessageExt";
import { MessageFile } from "../Entities/MessageFile";
import { MessageStatusHistory } from "../Entities/MessageStatusHistory";
import { FileDto, HistoryDto } from "./dto";
import { arrayParser } from "../shared/utils/arrayParser";
import { HistoryRequestQuery } from "./types";
import { MessageFilesRequestQuery, MessageRequestQuery } from "./types";

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

  async getMessages(query: MessageRequestQuery): Promise<Message[]> {
    try {
      const qb = this.messageRepo.createQueryBuilder(`msg`).select([
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
      ]).skip(query.limit * (query.page - 1)).take(query.limit)
      const messages = qb.getMany()
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

  async getHistoryByQb(messageId: string, query: HistoryRequestQuery): Promise<
    MessageStatusHistory[]
  > {
    const order: any = {}
    const newStatuses = arrayParser(query.newStatuses)
    const oldStatuses = arrayParser(query.oldStatuses)
    const userTypes = arrayParser(query.userType)

    const qb = this.messageStatusHistoryRepo.createQueryBuilder(`history`)
      .leftJoinAndSelect(`history.user`, 'user').where(`history.messageId = :id`, { id: messageId })

    if (newStatuses && newStatuses.length > 0) {
      qb.andWhere(`history.newStatus IN (:...newStatuses)`, { newStatuses });
    }

    if (oldStatuses && oldStatuses.length > 0) {
      qb.andWhere(`history.oldStatus IN (:...oldStatuses)`, { oldStatuses });
    }

    if (userTypes && userTypes.length > 0) {
      qb.andWhere(`user.userType IN (:...userTypes)`, { userTypes })
    }
    if (query.changeDatetime) {
      order[`history.changeDatetime`] = query.changeDatetime
    }
    const skip = query.limit * (query.page - 1)

    const result = await qb
      .skip(skip)
      .take(query.limit)
      .orderBy(order)
      .getMany()
    return result
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