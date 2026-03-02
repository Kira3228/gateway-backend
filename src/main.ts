import 'reflect-metadata';
import express, { Router } from 'express'
import cors from 'cors'
import { connection } from './connection'
import { container } from 'tsyringe'
import { getRepository } from 'typeorm'
import { Message, MessageExt, MessageFile, MessageStatusHistory } from './Entities'
import { MessageConfigService, MessageConfigServiceToken } from './Message/message-config.service'
import { MessageRepositoryToken, MessageService, } from './Message/message.service'
import { MessageController, MessageServiceToken, RouterToken } from './Message/message.controller'
import { MessageExtRepositoryToken, MessageExtService, MessageExtServiceToken } from './Message/extended-data.service'
import { MessageStatusHistoryRepositoryToken, MessageStatusHistoryService, MessageStatusHistoryServiceToken, } from './Message/status-history.service'
import { MessageFileRepositoryToken, MessageFileService, MessageFileServiceToken } from './Message/message-file.service'

import config from '../config.json'

import { Controller, Delete, Get, Patch, Post, PREFIX_META, ROUTE_META, RouteInfo, VALIDATOR_META, } from './decorators'
import { ReportController } from './Export/report.controller';
import { ExportService, ExportServiceServiceToken } from './Export/export.service';

async function bootstrap() {
  const app = express()
  const PORT = process.env.PORT || 3000
  app.use(express.json())
  app.use(cors())

  await connection

  container.register(RouterToken, { useValue: Router() })

  container.register(MessageRepositoryToken, { useValue: getRepository(Message) });
  container.register(MessageServiceToken, { useClass: MessageService });

  container.register(MessageExtRepositoryToken, { useValue: getRepository(MessageExt) })
  container.register(MessageExtServiceToken, { useClass: MessageExtService });

  container.register(MessageFileRepositoryToken, { useValue: getRepository(MessageFile) })
  container.register(MessageFileServiceToken, { useClass: MessageFileService });

  container.register(MessageStatusHistoryRepositoryToken, { useValue: getRepository(MessageStatusHistory) })
  container.register(MessageStatusHistoryServiceToken, { useClass: MessageStatusHistoryService });

  container.register(MessageConfigServiceToken, { useClass: MessageConfigService })

  container.register(ExportServiceServiceToken, { useClass: ExportService })

  container.register(`ConfigToken`, { useValue: config })

  // const messageController = container.resolve(MessageController)

  const controllers: { new(...args: any[]): any }[] = [MessageController, ReportController]

  for (const ControllerClass of controllers) {
    const prefix = Reflect.getMetadata(PREFIX_META, ControllerClass) || '';
    const instance = container.resolve(ControllerClass);
    const routes: RouteInfo[] = Reflect.getMetadata(ROUTE_META, ControllerClass) || [];

    const router = Router();
    for (const route of routes) {
      const handler = (instance as any)[route.handler].bind(instance);
      (router as any)[route.method](route.path, handler);
    }
    app.use(prefix, router);
  }


  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

}

bootstrap().catch(error => {
  console.error("Application startup failed:", error);
  process.exit(1);
});