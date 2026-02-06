export interface IConfig {
  table_id: string
  default_preset: string
  presets: PresetConfig[]
}

export interface PresetConfig {
  presetName: string
  headers: IHeader[],
  default_filters?: IDefaultFilters
}

export interface IHeader {
  text: string
  value: string
  sortable: boolean
  isVisible: boolean
  width: number
  align?: string
}

export interface IDefaultFilters {
  sortBy?: string[]
  sortDesc?: boolean[]
}

export interface IException {
  field: string
  values: string[]
}
