import express from 'express'
import cors from 'cors'
import { connection } from './connection'
import { container } from 'tsyringe'
import { getRepository } from 'typeorm'
import { Message } from './Entities/Message'
import { MessageRepositoryToken } from './Message/message.service'

async function bootstrap() {
  const app = express()
  const PORT = process.env.PORT || 3000
  app.use(express.json())
  app.use(cors)
  await connection

  container.register(MessageRepositoryToken, {
    useValue: getRepository(Message)
  })








  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

}

bootstrap().catch(error => {
  console.error("Application startup failed:", error);
  process.exit(1);
});