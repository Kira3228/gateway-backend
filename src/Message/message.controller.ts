import { inject, injectable, InjectionToken } from "tsyringe";
import { MessageService } from "./message.service";
import { Request, Response, Router } from "express";
import { FileDto, HistoryDto } from "./dto";
import { extendedDataValidate, headerValidate, historyValidate, messageFilesValidate, messageValidate } from "./validators";
import { Validate } from "../decorators/validate";
import { ExtendedDataRequestParam, HeadersRequestQuery, HistoryRequestParams, HistoryRequestQuery, MessageFilesRequestParam, MessageFilesRequestQuery, MessageRequestQuery } from "./types";
import { MessageExtService, MessageExtServiceToken } from "./extended-data.service";
import { MessageStatusHistoryService, MessageStatusHistoryServiceToken } from "./status-history.service";
import { MessageFileService, MessageFileServiceToken } from "./message-file.service";
import { MessageConfigService, MessageConfigServiceToken } from "./message-config.service";
import { PresetConfig } from "../shared/utils/types/IConfig";

export const MessageServiceToken: InjectionToken<MessageService> = "MessageService"
export const RouterToken: InjectionToken<Router> = "RouterToken"

@injectable()
export class MessageController {
  constructor(
    @inject(MessageServiceToken) private readonly messageService: MessageService,
    @inject(MessageExtServiceToken) private readonly messageExtService: MessageExtService,
    @inject(MessageStatusHistoryServiceToken) private readonly messageStatusHistoryService: MessageStatusHistoryService,
    @inject(MessageFileServiceToken) private readonly messageFileService: MessageFileService,
    @inject(MessageConfigServiceToken) private readonly messageConfigService: MessageConfigService,
    @inject(RouterToken) private readonly router: Router,
  ) {
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.get(`/all`, messageValidate, this.getAllMessages.bind(this))
    this.router.get(`/preset`, this.getPreset.bind(this))
    this.router.get(`/preset/names`, this.getPresetNames.bind(this))
    this.router.get(`/headers`, headerValidate, this.getHeaders.bind(this))
    this.router.get('/extended/:id', extendedDataValidate, this.getExtendedData.bind(this))
    this.router.get('/files/:id', messageFilesValidate, this.getMessageFiles.bind(this))
    this.router.get('/history/:id', historyValidate, this.getHistory.bind(this))

    this.router.post('/preset/create', this.createPreset.bind(this))
    this.router.post('/files/create', this.createFiles.bind(this))
    this.router.post('/history/create', this.createStatusHistory.bind(this))

    this.router.delete('/preset/delete', this.deletePreset.bind(this))
    this.router.patch('/preset/update', this.updatePreset.bind(this))
  }

  async getPresetNames(_, res: Response) {
    const presets = await this.messageConfigService.getPresetNames()
    res.status(200).json(presets)
  }

  async getPreset(req: Request<{}, {}, {}, { presetName?: string }>, res: Response) {
    const preset = await this.messageConfigService.getPreset(req.query.presetName)
    res.status(200).json(preset)
  }

  async createPreset(req: Request<any, any, PresetConfig>, res: Response) {
    const preset = await this.messageConfigService.createPreset(req.body)
    res.status(200).json(preset)
  }

  async deletePreset(req: Request<any, any, { presetName: string }>, res: Response) {
    const preset = await this.messageConfigService.deletePreset(req.body.presetName)
    res.status(200).json(preset)
  }

  async updatePreset(req: Request<any, any, PresetConfig>, res: Response) {
    const preset = await this.messageConfigService.updatePreset(req.body)
    res.status(200).json(preset)
  }

  @Validate()
  async getHeaders(req: Request<{}, {}, {}, HeadersRequestQuery>, res: Response) {
    const headers = await this.messageConfigService.getHeaders(req.query.presetName)
    res.status(200).json(headers)
  }

  @Validate()
  async getAllMessages(req: Request<{}, {}, {}, MessageRequestQuery>, res: Response) {
    const messages = await this.messageService.getMessages(req.query)
    res.status(200).json(messages)
  }

  @Validate()
  async getExtendedData(req: Request<ExtendedDataRequestParam>, res: Response) {
    const extendeds = await this.messageExtService.getExtendedDataByMsgId(req.params.id)
    res.status(200).json(extendeds)
  }

  @Validate()
  async getMessageFiles(req: Request<MessageFilesRequestParam, {}, {}, MessageFilesRequestQuery>, res: Response) {
    const files = await this.messageFileService.getMessageFilesByQb(req.params.id, req.query)
    res.status(200).json(files)
  }

  @Validate()
  async getHistory(req: Request<HistoryRequestParams, {}, {}, HistoryRequestQuery>, res: Response) {
    const history = await this.messageStatusHistoryService.getHistoryByQb(req.params.id, req.query)
    res.status(200).json(history)
  }
 
  async createFiles(req: Request, res: Response) {
    try {
      const dto: FileDto[] = req.body
      const files = await this.messageFileService.createFiles(dto)
      res.status(200).json(files)
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async createStatusHistory(req: Request, res: Response) {
    const dto: HistoryDto[] = req.body
    const history = await this.messageStatusHistoryService.createStatusHistory(dto)
    res.status(200).json(history)
  }

  getRoutes() {
    return this.router
  }
}