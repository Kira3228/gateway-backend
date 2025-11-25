import { inject, injectable, InjectionToken } from "tsyringe";
import { Repository } from "typeorm";
import { MessageStatusHistory } from "../Entities";
import { HistoryDto } from "./dto";
import { arrayParser } from "../shared/utils/arrayParser";
import { HistoryRequestQuery } from "./types";

export const MessageStatusHistoryRepositoryToken: InjectionToken<Repository<MessageStatusHistory>> = "MessageStatusHistoryToken"

export const MessageStatusHistoryServiceToken: InjectionToken<MessageStatusHistoryService> = "MessageStatusHistoryServiceToken"

@injectable()
export class MessageStatusHistoryService {
  constructor(
    @inject(MessageStatusHistoryRepositoryToken) private readonly messageStatusHistoryRepo: Repository<MessageStatusHistory>

  ) { }
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

  async createStatusHistory(dto: HistoryDto[]) {
    const history = this.messageStatusHistoryRepo.create(dto)
    await this.messageStatusHistoryRepo.save(history)
    return history
  }

}