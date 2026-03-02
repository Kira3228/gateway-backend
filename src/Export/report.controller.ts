import { inject, injectable } from "tsyringe";
import { Controller, Get } from "../decorators";
import { ExportService, ExportServiceServiceToken } from "./export.service";
import { Request, Response } from "express";
import { log } from "console";
import { MessageExportDto } from "./dto/message-export.dto";

@Controller(`/report`)
@injectable()
export class ReportController {
  constructor(
    @inject(ExportServiceServiceToken) private readonly exportService: ExportService
  ) { }

  @Get(`/message/json`)
  async getMessageReportJson(req: Request<{}, {}, {}, MessageExportDto>, res: Response) {
    await this.exportService.getJsonReport(res, req.query)
  }

  @Get(`/message/csv`)
  async getMessageReportCsv(req: Request<{}, {}, {}, MessageExportDto>, res: Response) {
    await this.exportService.getCsvReport(res, req.query)
  }
}