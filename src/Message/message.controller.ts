import { inject, injectable, InjectionToken } from "tsyringe";
import { MessageService } from "./message.service";
import { Request, Response, Router } from "express";
import { IMessageFilters } from "./message.interface";
import { BaseController } from "./base.controller";
import { log } from "console";
import { FileDto, HistoryDto } from "./dto";
import { PassThrough } from "stream";
import { IHistoryFilters } from "./types/IHistoryFilters";

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
    this.router.post('/files/create', this.createFiles.bind(this))
    this.router.post('/history/create', this.createStatusHistory.bind(this))

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
    const extendeds = await this.messageService.getExtendedDataByMsgId(msgId)
    res.status(200).json(extendeds)
  }

  async getMessageFiles(req: Request, res: Response) {
    const msgId = req.params.id
    const order: { sortField?: string, sortOrder?: "ASC" | "DESC" } = req.query
    log(order)
    // const files = await this.messageService.getMessageFile(msgId, order.sortField, order.sortOrder)
    const files = await this.messageService.getMessageFilesByQb(msgId, 8, 1)
    res.status(200).json(files)

    // return await this.messageService.getMessageFilesByQb()
  }


  async getHistory(req: Request, res: Response) {
    const messageId = Number(req.params.id)
    const filters: IHistoryFilters = {
      oldStatuses: req.query.oldStatuses as string,
      newStatuses: req.query.newStatuses as string,
      sortField: req.query.sortField as string,
      sortOrder: req.query.sortOrder as "ASC" | "DECS",
      userTypes: req.query.userTypes as string
    }
    log(filters)
    const history = await this.messageService.getHistoryByQb({ _messageId: messageId })
    res.status(200).json(history)


    // return await this.messageService.getHistoryByQb({ _messageId: 1 })
  }

  async createFiles(req: Request, res: Response) {
    try {
      const dto: FileDto[] = req.body
      const files = await this.messageService.createFiles(dto)
      res.status(200).json(files)
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async createStatusHistory(req: Request, res: Response) {
    const dto: HistoryDto[] = req.body
    const history = await this.messageService.createStatusHistory(dto)
    res.status(200).json(history)
  }

  getRoutes() {
    return this.router
  }

}