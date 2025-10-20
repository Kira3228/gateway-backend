import { InjectionToken } from "tsyringe";
import { BaseConfigService } from "./base-config.service";
import tableConfig from './config.json'


export const MessageConfigServiceToken: InjectionToken<MessageConfigService> = "MessageConfigService"

export class MessageConfigService extends BaseConfigService {
  constructor() {
    super(tableConfig)
  }
}