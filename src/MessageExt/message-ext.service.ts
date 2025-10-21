import { inject, injectable, InjectionToken } from "tsyringe";
import { Repository } from "typeorm";
import { MessageExt } from "../Entities/MessageExt";

export const MessageExtRepositoryToken: InjectionToken<Repository<MessageExt>> = "MessageExtRepositoryToken"
export const MessageExtServiceToken: InjectionToken<MessageExtService> = "MessageExtServiceToken"

@injectable()
export class MessageExtService {
  constructor(@inject(MessageExtRepositoryToken) private readonly messageExtRepo: Repository<MessageExt>) { }

  async getExtendedDataByMsgId(messageId: string) {
    const details = await this.messageExtRepo.find({
      where: { message: messageId },
      relations: ["message"]
    })
    return details
  }
}