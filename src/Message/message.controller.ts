import { inject, injectable, InjectionToken } from "tsyringe";
import { MessageService } from "./message.service";
import { Request, Response, Router } from "express";

export const MessageServiceToken: InjectionToken<MessageService> = "MessageService"
export const RouterToken: InjectionToken<Router> = "RouterToken"
@injectable()
export class MessageController {
  constructor(@inject(MessageServiceToken) private readonly messageService: MessageService,
    @inject(RouterToken) private readonly router: Router
  ) {
    this.initializeRoutes()
  }
  private initializeRoutes(): void {
    this.router.get(`/messages`, this.getAllMessages.bind(this))
  }

  async getAllMessages(req: Request, res: Response) {
    const messages = await this.messageService.getAllMessages()
    res.status(200).json(messages)
  }

  getRoutes() {
    return this.router
  }
}