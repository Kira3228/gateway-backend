import { inject, injectable, InjectionToken } from "tsyringe";
import { IConfig, IDefaultFilters, IHeader, PresetConfig } from "../shared/utils/types/IConfig";
import * as fs from 'fs';
import { promisify } from 'util';
import { join } from "path"
import { log } from "console";

export const MessageConfigServiceToken: InjectionToken<MessageConfigService> = "MessageConfigServiceToken"

const CONFIG_PATH = join(__dirname, "..", '..', "config.json")
@injectable()
export class MessageConfigService {
  constructor(@inject(`ConfigToken`) private readonly config: IConfig) { }

  getPreset(presetName?: string): PresetConfig | null {
    try {
      if (!presetName) {
        return this.config.presets?.[0] || null
      }
      const result = this.config.presets?.find(
        (preset: PresetConfig) => preset.presetName === presetName
      ) || null

      return result
    }
    catch (error) {
      console.error(error);
    }
  }

  getPresetNames(): string[] {
    try {
      return this.config.presets?.map((preset: PresetConfig) => preset.presetName) || []
    }
    catch (error) {
      console.error(error);
      return [];
    }
  }

  getHeaders(presetName?: string) {
    try {
      const preset = this.getPreset(presetName)
      return preset?.headers || []
    }
    catch (error) {
      console.error(error);
      return []
    }
  }

  getFilters(presetName?: string): IDefaultFilters {
    try {
      const preset = this.getPreset(presetName)
      return preset?.default_filters
    }
    catch (error) {
      console.error(error);
      return {}
    }
  }

  async createPreset(body: PresetConfig) {
    if (body.presetName === '' || !body.presetName) {
      throw new Error(`Пресет пустым именем не может существовать`);
    }

    if (this.config.presets.some(p => p.presetName === body.presetName)) {
      throw new Error(`Пресет с именем "${body.presetName}" уже существует`);
    }
    const previousPresets = [...this.config.presets];

    this.config.presets = [...this.config.presets, body];

    try {
      await this.saveConfig();
    } catch (error) {
      this.config.presets = previousPresets;
      throw new Error(`Не удалось сохранить пресет: ${error.message}`);
    }

    return this.config.presets.map(p => p.presetName);
  }

  async deletePreset(presetName: string) {
    if (presetName === 'standart') {
      throw new Error(`Данный пресет невозможно удалить`);
    }

    const previousPresets = [...this.config.presets];
    const newPresets = this.config.presets.filter(p => p.presetName !== presetName);

    if (newPresets.length === this.config.presets.length) {
      return this.config.presets.map(p => p.presetName);
    }

    this.config.presets = newPresets;

    try {
      await this.saveConfig();
    } catch (error) {
      this.config.presets = previousPresets;
      throw error;
    }

    return this.config.presets.map(p => p.presetName);
  }

  async updatePreset(body: PresetConfig) {
    log(body)
    const index = this.config.presets.findIndex(p => p.presetName === body.presetName);

    if (index === -1) {
      throw new Error(`Пресет с именем "${body.presetName}" не найден`);
    }

    const previousPresets = [...this.config.presets];
    const newPresets = [...this.config.presets];
    newPresets[index] = body;
    this.config.presets = newPresets;

    try {
      await this.saveConfig();
    } catch (error) {
      this.config.presets = previousPresets;
      console.error(error);
      throw new Error(`Не удалось обновить файл конфигурации`);
    }

    return this.config.presets.map(p => p.presetName);
  }


  private async saveConfig() {
    const cfgToSave = {
      ...this.config,
      presets: this.config.presets
    };
    const writeFileAsync = promisify(fs.writeFile);
    await writeFileAsync(CONFIG_PATH, JSON.stringify(cfgToSave, null, 2));
  }
}