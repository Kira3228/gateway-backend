import { inject, injectable, InjectionToken } from "tsyringe";
import { Repository } from "typeorm";
import { MessageStatusHistory } from "../Entities";
import { HistoryDto } from "./dto";
import { arrayParser } from "../shared/utils/arrayParser";
import { HistoryRequestQuery } from "./types";
import { log } from "console";

export const MessageStatusHistoryRepositoryToken: InjectionToken<Repository<MessageStatusHistory>> = "MessageStatusHistoryToken"

export const MessageStatusHistoryServiceToken: InjectionToken<MessageStatusHistoryService> = "MessageStatusHistoryServiceToken"

@injectable()
export class MessageStatusHistoryService {
  constructor(
    @inject(MessageStatusHistoryRepositoryToken) private readonly messageStatusHistoryRepo: Repository<MessageStatusHistory>

  ) { }
  async getHistoryByQb(messageId: string, query: HistoryRequestQuery): Promise<
    {
      history: MessageStatusHistory[]
      totalPage: number
    }
  > {
    const order: any = {}
    const newStatuses = arrayParser(query.newStatuses)
    const oldStatuses = arrayParser(query.oldStatuses)
    const userTypes = arrayParser(query.userType)

    log(query)
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

    const [history, historyCount] = await qb
      .skip(skip)
      .take(query.limit)
      .orderBy(order)
      .getManyAndCount()

    return {
      history,
      totalPage: Math.ceil(historyCount / query.limit)
    }
  }

  async createStatusHistory(dto: HistoryDto[]) {
    const history = this.messageStatusHistoryRepo.create(dto)
    await this.messageStatusHistoryRepo.save(history)
    return history
  }

}