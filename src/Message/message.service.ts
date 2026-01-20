import { inject, injectable, InjectionToken } from "tsyringe";
import { Repository, } from "typeorm";
import { Message } from "../Entities";
import { MessageRequestQuery } from "./types";

export const MessageRepositoryToken: InjectionToken<Repository<Message>> = "MessageRepositoryToken";

@injectable()
export class MessageService {
  constructor(
    @inject(MessageRepositoryToken) private readonly messageRepo: Repository<Message>,
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
      const [messages, messageCount] = await qb.getManyAndCount()
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