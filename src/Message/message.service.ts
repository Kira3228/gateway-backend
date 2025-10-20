import { inject, injectable, InjectionToken } from "tsyringe";
import { MetadataWithSuchNameAlreadyExistsError, Repository, SelectQueryBuilder } from "typeorm";
import { Message } from "../Entities/Message";
import { PaginatedResult } from "../shared/utils/types/common.interface";
import { IMessageFilters } from "./message.interface";
import { paginate } from "../shared/utils/paginate";
import { IDefaultFilters, IHeader } from "../shared/utils/types/IConfig";
import { MessageConfigService, MessageConfigServiceToken } from "./message-config.service";
import { log } from "console";

export const MessageRepositoryToken: InjectionToken<Repository<Message>> = "MessageRepository";

@injectable()
export class MessageService {
  constructor(
    @inject(MessageRepositoryToken) private readonly messageRepo: Repository<Message>,
    @inject(MessageConfigServiceToken) private readonly configService: MessageConfigService
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
    return await paginate(qb, page, limit, `events`)
  }

  async getMessages(filters?: IMessageFilters): Promise<PaginatedResult<Message>> {
    try {
      const qb = this.createBaseQuery()
      const paginate = await this.paginateQuery(qb, filters)
      return paginate
    }
    catch (error) {
      console.error(error);
    }
  }




}