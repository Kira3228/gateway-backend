import { inject, injectable, InjectionToken } from "tsyringe";
import { MessageService } from "./message.service";
import { Request, Response, Router } from "express";
import { extendedDataValidate, headerValidate, historyValidate, messageFilesValidate, messageValidate } from "./validators";
import { ExtendedDataRequestParam, HeadersRequestQuery, HistoryRequestParams, HistoryRequestQuery, MessageFilesRequestParam, MessageFilesRequestQuery, MessageRequestQuery } from "./types";
import { MessageExtService, MessageExtServiceToken } from "./extended-data.service";
import { MessageStatusHistoryService, MessageStatusHistoryServiceToken } from "./status-history.service";
import { MessageFileService, MessageFileServiceToken } from "./message-file.service";
import { MessageConfigService, MessageConfigServiceToken } from "./message-config.service";
import { PresetConfig } from "../shared/utils/types/IConfig";
import { log } from "console";
import { Controller, Delete, Get, Patch, Post } from "../decorators";
import { UseValidators } from "../decorators/validate";

export const MessageServiceToken: InjectionToken<MessageService> = "MessageService"
export const RouterToken: InjectionToken<Router> = "RouterToken"

@Controller(`/messages`)
@injectable()
export class MessageController {
  constructor(
    @inject(MessageServiceToken) private readonly messageService: MessageService,
    @inject(MessageExtServiceToken) private readonly messageExtService: MessageExtService,
    @inject(MessageStatusHistoryServiceToken) private readonly messageStatusHistoryService: MessageStatusHistoryService,
    @inject(MessageFileServiceToken) private readonly messageFileService: MessageFileService,
    @inject(MessageConfigServiceToken) private readonly messageConfigService: MessageConfigService,
  ) {
  }

  @Get(`/preset/names`)
  async getPresetNames(_, res: Response) {
    const presets = await this.messageConfigService.getPresetNames()
    res.status(200).json(presets)
  }
  @Get(`/preset`)
  async getPreset(req: Request<{}, {}, {}, { presetName?: string }>, res: Response) {
    const preset = await this.messageConfigService.getPreset(req.query.presetName)
    res.status(200).json(preset)
  }
  @Post('/preset/create')
  async createPreset(req: Request<any, any, PresetConfig>, res: Response) {
    const preset = await this.messageConfigService.createPreset(req.body)
    res.status(200).json(preset)
  }

  @Delete('/preset/delete')
  async deletePreset(req: Request<any, any, { presetName: string }>, res: Response) {
    const preset = await this.messageConfigService.deletePreset(req.body.presetName)
    res.status(200).json(preset)
  }

  @Patch('/preset/update')
  async updatePreset(req: Request<any, any, PresetConfig>, res: Response) {
    const preset = await this.messageConfigService.updatePreset(req.body)
    res.status(200).json(preset)
  }

  @Get(`/headers`)
  @UseValidators(headerValidate)
  async getHeaders(req: Request<{}, {}, {}, HeadersRequestQuery>, res: Response) {
    const headers = await this.messageConfigService.getHeaders(req.query.presetName)
    res.status(200).json(headers)
  }

  @Get(`/all`)
  @UseValidators(messageValidate)
  async getAllMessages(req: Request<{}, {}, {}, MessageRequestQuery>, res: Response) {
    log(req.query)
    const messages = await this.messageService.getMessages(req.query)
    res.status(200).json(messages)
  }

  @Get('/extended/:id')
  @UseValidators(extendedDataValidate)
  async getExtendedData(req: Request<ExtendedDataRequestParam>, res: Response) {
    const extendeds = await this.messageExtService.getExtendedDataByMsgId(req.params.id)
    res.status(200).json(extendeds)
  }

  @Get('/files/:id')
  @UseValidators(messageFilesValidate)
  async getMessageFiles(req: Request<MessageFilesRequestParam, {}, {}, MessageFilesRequestQuery>, res: Response) {
    const files = await this.messageFileService.getMessageFilesByQb(req.params.id, req.query)
    res.status(200).json(files)
  }

  @Get(`/history/:id`)
  @UseValidators(historyValidate)
  async getHistory(req: Request<HistoryRequestParams, {}, {}, HistoryRequestQuery>, res: Response) {
    log(req.query)
    const history = await this.messageStatusHistoryService.getHistoryByQb(req.params.id, req.query)
    res.status(200).json(history)
  }
}