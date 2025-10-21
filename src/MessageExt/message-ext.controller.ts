import { inject, injectable } from "tsyringe";
import { MessageExtService, MessageExtServiceToken } from "./message-ext.service";
import { RouterToken } from "../Message/message.controller";
import { Request, Response, Router } from "express";
import { log } from "console";


@injectable()
export class MessageExtController {
  constructor(
    @inject(MessageExtServiceToken) private readonly messageExtService: MessageExtService,
    @inject(RouterToken) private readonly router: Router
  ) {
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.get('/all/:id', this.getExtendedData.bind(this))
  }

  async getExtendedData(req: Request, res: Response) {
    const msgId = req.params.id
    log(msgId)
    const test = await this.messageExtService.getExtendedDataByMsgId(msgId)
    res.status(200).json(test)
  }

  getRoutes() {
    return this.router
  }
}