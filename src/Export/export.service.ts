import { inject, injectable, InjectionToken } from "tsyringe";
import { MessageServiceToken } from "../Message/message.controller";
import { MessageRepositoryToken, MessageService } from "../Message/message.service";
import { format } from 'fast-csv';
import { Message } from "../Entities";
import { Repository } from "typeorm";
import { Response } from "express";
import { MessageConfigService, MessageConfigServiceToken } from "../Message/message-config.service";
import { MessageExportDto } from "./dto/message-export.dto";

export const ExportServiceServiceToken: InjectionToken<ExportService> = "ExportServiceServiceToken"


@injectable()
export class ExportService {
  constructor(
    @inject(MessageServiceToken) private readonly messageService: MessageService,
    @inject(MessageRepositoryToken) private readonly messageRepo: Repository<Message>,
    @inject(MessageConfigServiceToken) private readonly configService: MessageConfigService,
  ) { }

  async getJsonReport(res: Response, params: MessageExportDto): Promise<void> {
    const queryRunner = this.messageRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();

    let isReleased = false;
    const release = async () => {
      if (!isReleased) {
        await queryRunner.release();
        isReleased = true;
      }
    };

    try {
      const fields = await this.configService.getHeaders(params.presetName);
      const activeFields = params.invisibleFieldsIsAvailable === "false"
        ? fields.filter(f => f.isVisible)
        : fields;

      const fieldKeys = activeFields.map(f => f.value);
      const fieldsWithAliases = activeFields.map(f => `msg.${f.value} AS "${f.value}"`);

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="report.json"');

      res.write('[');

      const qb = await queryRunner.manager
        .createQueryBuilder(Message, 'msg')
        .select(fieldsWithAliases)

      const dbStream = await qb.stream()

      let isFirstRow = true;

      dbStream.on('data', (row) => {
        if (!isFirstRow) {
          res.write(',');
        }
        isFirstRow = false;

        const cleanRow = {};
        fieldKeys.forEach(key => {
          cleanRow[key] = row[key] ?? row[`msg_${key}`] ?? row[`msg.${key}`] ?? null;
        });

        if (cleanRow['metadataParsed'] && typeof cleanRow['metadataParsed'] === 'string') {
          try {
            cleanRow['metadataParsed'] = JSON.parse(cleanRow['metadataParsed']);
          } catch (e) { }
        }

        if (!res.write(JSON.stringify(cleanRow))) {
          dbStream.pause();
        }
      });

      res.on('drain', () => {
        dbStream.resume();
      });

      dbStream.on('end', async () => {
        res.write(']');
        res.end();
        await release();
      });

      dbStream.on('error', async (err) => {
        console.error('DB Stream Error:', err);
        if (!res.headersSent) res.status(500).send('Error');
        await release();
      });

      res.on('close', async () => {
        await release();
      });

    } catch (error) {
      await release();
      throw error;
    }
  }

  async getCsvReport(res: Response, params: MessageExportDto): Promise<void> {
    const queryRunner = this.messageRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();

    let isReleased = false;
    const release = async () => {
      if (!isReleased) {
        await queryRunner.release();
        isReleased = true;
      }
    };

    try {
      const fields = await this.configService.getHeaders(params.presetName);

      const activeFields = params.invisibleFieldsIsAvailable === "false"
        ? fields.filter(f => f.isVisible)
        : fields;

      const csvHeaders = activeFields.map(f => f.value);
      const fieldsWithAliases = activeFields.map(f => `msg.${f.value} AS "${f.value}"`);

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="report.csv"');
      res.write('\ufeff');

      const csvStream = format({
        headers: csvHeaders,
        writeHeaders: true,
        delimiter: ';',
      });

      csvStream.pipe(res);

      const dbStream = await queryRunner.manager
        .createQueryBuilder(Message, 'msg')
        .select(fieldsWithAliases)
        .stream();

      dbStream.on('data', (data) => {
        const cleanRow = {};
        csvHeaders.forEach(key => {
          cleanRow[key] = data[key] ?? data[`msg_${key}`] ?? data[`msg.${key}`] ?? '';
        });

        if (!csvStream.write(cleanRow)) {
          dbStream.pause();
        }
      });

      csvStream.on('drain', () => {
        dbStream.resume();
      });

      dbStream.on('end', () => {
        csvStream.end();
      });

      dbStream.on('error', async (err) => {
        console.error('DB Stream Error:', err);
        csvStream.destroy();
        await release();
      });

      res.on('close', async () => {
        await release();
      });

      csvStream.on('finish', async () => {
        await release();
      });

    } catch (error) {
      await release();
      throw error;
    }
  }
}