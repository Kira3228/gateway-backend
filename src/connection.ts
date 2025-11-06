import { createConnection } from "typeorm";
import { Message } from "./Entities/Message";
import { MessageExt } from "./Entities/MessageExt";
import { MessageFile } from "./Entities/MessageFile";
import { MessageStatusHistory } from "./Entities/MessageStatusHistory";
import { MetadataTemplate } from "./Entities/MetadataTemplate";
import { Point } from "./Entities/Point";
import { System } from "./Entities/System";
import { User } from "./Entities/User";

export const connection = createConnection({
  type: `postgres`,
  host: `localhost`,
  port: 5432,
  username: `administrator`,
  password: `root`,
  database: `gateway`,
  entities: [Message, MessageExt, MessageFile, MessageStatusHistory, MetadataTemplate, Point, System, User],
  synchronize: false,
  logging: false
}).then(connection => console.log(`Connected to DB`)).catch(error => console.log(error))