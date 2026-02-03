import { inject, injectable, InjectionToken } from "tsyringe";
import { Repository, } from "typeorm";
import { Message } from "../Entities";
import { MessageRequestQuery } from "./types";
import { MessageConfigService, MessageConfigServiceToken } from "./message-config.service";

export const MessageRepositoryToken: InjectionToken<Repository<Message>> = "MessageRepositoryToken";

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

  async getMessages(query: MessageRequestQuery): Promise<{
    messages: Message[],
    messageCount: number,
    totalPage: number
  }> {
    try {
      const fields = this.configService.getHeaders(query.presetName)

      const fieldsForQb = fields.map((field) => `msg.${field.value}`)

      const qb = this.messageRepo
        .createQueryBuilder(`msg`)
        .select(fieldsForQb)
        .skip(query.limit * (query.page - 1))
        .take(query.limit)

      const [messages, messageCount] = await qb.getManyAndCount()

      if (!messages) {
        throw new Error(`Сообщения не найдены`)
      }

      return {
        messages,
        messageCount,
        totalPage: Math.ceil((messageCount / query.limit))
      }
    }
    catch (error) {
      console.error(error);
    }
  }


}