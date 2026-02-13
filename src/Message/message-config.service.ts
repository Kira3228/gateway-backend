import { inject, injectable, InjectionToken } from "tsyringe";
import { IConfig, IDefaultFilters, IHeader, PresetConfig } from "../shared/utils/types/IConfig";
import * as fs from 'fs';
import { promisify } from 'util';
import { join } from "path"


export const MessageConfigServiceToken: InjectionToken<MessageConfigService> = "MessageConfigServiceToken"

const path = join(__dirname, "..", '..', "config.json")
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
    const existingPreset = this.config
      .presets.find((preset) => { return preset.presetName === body.presetName })

    if (existingPreset) {
      throw new Error(`Пресет с этим именем уже существует`)
    }

    this.config.presets = [...this.config.presets, body];
    const cfgToSave = {
      ...this.config,
      presets: this.config.presets
    };
    try {
      const writeFileAsync = promisify(fs.writeFile);
      await writeFileAsync(path, JSON.stringify(cfgToSave));
    } catch (error) {
      this.config.presets = this.config.presets.filter(p => p.presetName !== body.presetName);
      throw new Error(`Не удалось сохранить пресет: ${error.message}`);
    }
    return this.config.presets.map((preset) => preset.presetName)
  }


  async deletePreset(presetName: string) {
    const newPresets = this.config.presets.filter((preset) => preset.presetName !== presetName);

    const cfg = {
      "default_preset": "standart",
      "presets": newPresets
    };

    const writeFileAsync = promisify(fs.writeFile);
    await writeFileAsync(path, JSON.stringify(cfg, null, 2)); // null, 2 для красивого форматирования

    this.config.presets = newPresets;

    return newPresets.map((preset) => preset.presetName);
  }
}