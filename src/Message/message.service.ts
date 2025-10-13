import { inject, injectable, InjectionToken } from "tsyringe";
import { Repository } from "typeorm";
import { Message } from "../Entities/Message";

export const MessageRepositoryToken: InjectionToken<Repository<Message>> = "MessageRepository";

@injectable()
export class MessageService {
  constructor(@inject(MessageRepositoryToken) private readonly messageRepo: Repository<Message>) { }

  async getAllMessages() {
    const messages = await this.messageRepo.find()
    return messages
  }

}