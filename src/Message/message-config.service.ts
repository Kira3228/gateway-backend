import { inject, injectable, InjectionToken } from "tsyringe";
import { IConfig, IDefaultFilters, IHeader, PresetConfig } from "../shared/utils/types/IConfig";

export const MessageConfigServiceToken: InjectionToken<MessageConfigService> = "MessageConfigServiceToken"

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

  // getFieldExceptions(presetName: string, field: string): string[] {
  //   try {
  //     const preset = this.getPreset(presetName)
  //     return preset?.exceptions?.[field] || []
  //   }
  //   catch (error) {
  //     console.error(error);
  //     return []
  //   }
  // }

  createPreset(presetName: string, config: PresetConfig) {
    const existingPreset = this.config
      .presets.find((preset) => { return preset.presetName === presetName })

    if (existingPreset) {
      throw new Error(`Пресет с этим именем уже существует`)
    }

    this.config.presets = [...this.config.presets, config]

    return { success: true }
  }
}