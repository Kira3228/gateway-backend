import { inject, injectable, InjectionToken } from "tsyringe";
import { Repository, SelectQueryBuilder, } from "typeorm";
import { Message } from "../Entities";
import { MessageRequestQuery } from "./types";
import { MessageConfigService, MessageConfigServiceToken } from "./message-config.service";
import { IHeader } from "../shared/utils/types/IConfig";
import { arrayParser } from "../shared/utils/arrayParser";

export const MessageRepositoryToken: InjectionToken<Repository<Message>> = "MessageRepositoryToken";

@injectable()
export class MessageService {
  constructor(
    @inject(MessageRepositoryToken) private readonly messageRepo: Repository<Message>,
    @inject(MessageConfigServiceToken) private readonly configService: MessageConfigService
  ) { }

  async getMessages(query: MessageRequestQuery): Promise<{
    messages: Message[],
    messageCount: number,
    totalPage: number,
    fields: IHeader[]
  }> {
    try {
      const fields = this.configService.getHeaders(query.presetName)

      const fieldsForQb = fields.map((field) => `msg.${field.value}`)

      const qb = this.messageRepo
        .createQueryBuilder(`msg`)
        .select(fieldsForQb)
        .skip(query.limit * (query.page - 1))
        .take(query.limit)

      this.applyMessageParams(qb, {
        categories: query.categories,
        metadata: query.metadata,
        createDateRange: query.createDateRange,
        updateDateRange: query.updateDateRange,
        statuses: query.statuses,
        securityLabels: query.securityLabels,
        priority: query.priority,
        messageTypes: query.messageTypes
      })


      const [messages, messageCount] = await qb.getManyAndCount()

      if (!messages) {
        throw new Error(`Сообщения не найдены`)
      }

      return {
        messages,
        messageCount,
        totalPage: Math.ceil((messageCount / query.limit)),
        fields
      }
    }
    catch (error) {
      console.error(error);
    }
  }

  async getMessageStream(fields: string[], params: {
    priority?: [number, number]
    metadata?: boolean
    createDateRange?: [string, string]
    updateDateRange?: [string, string]
    categories?: string
    messageTypes?: string
    statuses?: string
    securityLabels?: string
  }) {
    const queryRunner = this.messageRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();

    let isReleased = false;
    const release = async () => {
      if (!isReleased) {
        await queryRunner.release();
        isReleased = true;
      }
    };

    const dbStream = await queryRunner.manager
      .createQueryBuilder(Message, 'msg')
      .select(fields)

    this.applyMessageParams(dbStream, params)

    return {
      dbStream: await dbStream.stream(),
      release
    }
  }

  private async applyMessageParams<T>(qb: SelectQueryBuilder<T>,
    params: {
      priority?: [number, number]
      metadata?: boolean
      createDateRange?: [string, string]
      updateDateRange?: [string, string]
      categories?: string
      messageTypes?: string
      statuses?: string
      securityLabels?: string
    }) {

    if (params.categories) {
      qb.andWhere(`msg.messageCategory IN (:...categories)`, { categories: arrayParser(params.categories) })
    }

    if (params.metadata) {
      qb.andWhere(`msg.metadataParsed = :metadata`, { metadata: params.metadata })
    }

    if (params.createDateRange) {
      const [startDateRaw, endDateRaw] = params.createDateRange

      const startDate = startDateRaw === '' ? null : startDateRaw
      const endDate = endDateRaw === '' ? null : endDateRaw

      if (startDate !== null || endDate !== null) {
        qb.andWhere(
          `(msg.createdAt >= COALESCE(:startDate, \'1970-01-01\') 
              AND msg.createdAt <= COALESCE(:endDate, NOW()))`,
          {
            startDate,
            endDate
          }
        )
      }
    }

    if (params.updateDateRange) {
      const [startDateRaw, endDateRaw] = params.updateDateRange

      const startDate = startDateRaw === '' ? null : startDateRaw
      const endDate = endDateRaw === '' ? null : endDateRaw

      if (startDate !== null || endDate !== null) {
        qb.andWhere(
          `(msg.updatedAt >= COALESCE(:startDate, \'1970-01-01\') 
              AND msg.updatedAt <= COALESCE(:endDate, NOW()))`,
          {
            startDate,
            endDate
          }
        )
      }
    }

    if (params.statuses) {
      qb.andWhere(`msg.status IN (:...statuses)`, {
        statuses: arrayParser(params.statuses)
      })
    }

    if (params.securityLabels) {
      qb.andWhere(`msg.securityLabel IN (:...securityLabels)`, {
        securityLabels: arrayParser(params.securityLabels)
      })
    }

    if (params.priority) {
      const [minPriorityRaw, maxPriorityRaw] = params.priority

      const minPriority = Number(minPriorityRaw)
      const maxPriority = Number(maxPriorityRaw)

      if (!isNaN(minPriority) || !isNaN(maxPriority)) {
        const conditions = []
        const params: any = {}

        if (!isNaN(minPriority)) {
          conditions.push(`msg.priority >= :minPriority`)
          params.minPriority = minPriority
        }

        if (!isNaN(maxPriority)) {
          conditions.push(`msg.priority <= :maxPriority`)
          params.maxPriority = maxPriority
        }

        qb.andWhere(`(${conditions.join(' AND ')})`, params)
      }
    }

    if (params.messageTypes) {
      qb.andWhere(`msg.messageType IN (:...messageTypes)`, {
        messageTypes: arrayParser(params.messageTypes)
      })
    }

    return qb
  }

}