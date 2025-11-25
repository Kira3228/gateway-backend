import { inject, injectable, InjectionToken } from "tsyringe"
import { Repository } from "typeorm"
import { MessageExt } from "../Entities"

export const MessageExtRepositoryToken: InjectionToken<Repository<MessageExt>> = "MessageExtRepositoryToken"
export const MessageExtServiceToken: InjectionToken<MessageExtService> = "MessageExtServiceToken"

@injectable()
export class MessageExtService {
  constructor(
    @inject(MessageExtRepositoryToken) private readonly messageExtRepo: Repository<MessageExt>,
  ) { }
  async getExtendedDataByMsgId(messageId: string) {
    const details = await this.messageExtRepo.findOne({
      where: { message: messageId },
      select: [
        "checksum",
        "createdAt",
        "delivered_at",
        "id",
        "metadata",
        "originalMetadata",
        "read_at",
        "received_at",
        "received_at",
        "receiving_at",
        "sending_at",
        "sent_at",
        "totalFilesCount",
        "totalSizeBytes",
      ]
    })
    return details
  }
}