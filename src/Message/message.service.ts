import { inject, injectable, InjectionToken } from "tsyringe";
import { Repository, } from "typeorm";
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

      if (query.categories) {
        qb.andWhere(`msg.messageCategory IN (:...categories)`, { categories: arrayParser(query.categories) })
      }

      if (query.metadata) {
        qb.andWhere(`msg.metadataParsed = :metadata`, { metadata: query.metadata })
      }

      if (query.createDateRange) {
        const [startDateRaw, endDateRaw] = query.createDateRange

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

      if (query.updateDateRange) {
        const [startDateRaw, endDateRaw] = query.updateDateRange

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

      if (query.statuses) {
        qb.andWhere(`msg.status IN (:...statuses)`, {
          statuses: arrayParser(query.statuses)
        })
      }

      if (query.securityLabels) {
        qb.andWhere(`msg.securityLabel IN (:...securityLabels)`, {
          securityLabels: arrayParser(query.securityLabels)
        })
      }

      if (query.priority) {
        const [minPriorityRaw, maxPriorityRaw] = query.priority

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

      if (query.messageTypes) {
        qb.andWhere(`msg.messageType IN (:...messageTypes)`, {
          messageTypes: arrayParser(query.messageTypes)
        })
      }
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
}