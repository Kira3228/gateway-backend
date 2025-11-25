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


}