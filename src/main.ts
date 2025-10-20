import express, { Router } from 'express'
import cors from 'cors'
import { connection } from './connection'
import { container } from 'tsyringe'
import { getRepository, Repository } from 'typeorm'
import { Message } from './Entities/Message'
import { MessageRepositoryToken, MessageService } from './Message/message.service'
import { MessageController, MessageServiceToken, RouterToken } from './Message/message.controller'
import { MessageConfigService, MessageConfigServiceToken } from './Message/message-config.service'

async function bootstrap() {
  const app = express()
  const PORT = process.env.PORT || 3000
  app.use(express.json())
  app.use(cors())

  await connection

  container.register(RouterToken, { useValue: Router() })
  container.register(MessageRepositoryToken, { useValue: getRepository(Message) });
  container.register(MessageServiceToken, { useClass: MessageService });
  container.register(MessageConfigServiceToken, { useClass: MessageConfigService })
  const messageController = container.resolve(MessageController)


  app.use(`/messages`, messageController.getRoutes())






  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

}

bootstrap().catch(error => {
  console.error("Application startup failed:", error);
  process.exit(1);
});