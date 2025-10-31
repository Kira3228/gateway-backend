import { inject, injectable, InjectionToken } from "tsyringe";
import { MessageService } from "./message.service";
import { Request, Response, Router } from "express";
import { IMessageFilters } from "./message.interface";
import { BaseController } from "./base.controller";
import { log } from "console";

export const MessageServiceToken: InjectionToken<MessageService> = "MessageService"
export const RouterToken: InjectionToken<Router> = "RouterToken"

@injectable()
export class MessageController extends BaseController {
  constructor(
    @inject(MessageServiceToken) private readonly messageService: MessageService,
    @inject(RouterToken) private readonly router: Router,
  ) {
    super()
    this.initializeRoutes()
  }
  private initializeRoutes(): void {
    this.router.get(`/`, this.getAllMessages.bind(this))
    this.router.get(`/preset/names`, this.getPresetNames.bind(this))
    this.router.get(`/headers`, this.getHeaders.bind(this))
    this.router.get('/extended/:id', this.getExtendedData.bind(this))
    this.router.get('/files/:id', this.getMessageFiles.bind(this))
    this.router.get('/history/:id', this.getHistory.bind(this))
  }
  async getPresetNames(req: Request, res: Response) {
    const presets = await this.messageService.getPresetNames()
    res.status(200).json(presets)
  }

  async getHeaders(req: Request, res: Response) {
    const presetName = req.query.presetName as string
    const headers = await this.messageService.getHeaders(presetName)
    res.status(200).json(headers)
  }

  async getAllMessages(req: Request, res: Response) {
    const filters: IMessageFilters = this.parsePaginationParams(req.query)
    log(filters)
    const messages = await this.messageService.getMessages(filters)
    res.status(200).json(messages)
  }


  async getExtendedData(req: Request, res: Response) {
    const msgId = req.params.id
    log(msgId)
    const extendeds = await this.messageService.getExtendedDataByMsgId(msgId)
    res.status(200).json(extendeds)
  }

  async getMessageFiles(req: Request, res: Response) {
    const msgId = req.params.id
    const order: { sortField?: string, sortOrder?: "ASC" | "DESC" } = req.query
    log(order)
    const files = await this.messageService.getMessageFile(msgId, order.sortField, order.sortOrder)
    res.status(200).json(files)
  }

  async getHistory(req: Request, res: Response) {
    const messageId = Number(req.params.id)
    log(messageId)
    const history = await this.messageService.getStatusHistory(messageId)
    res.status(200).json(history)
  }


  getRoutes() {
    return this.router
  }

}