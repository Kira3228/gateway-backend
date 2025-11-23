export interface IHistoryFilters {
  oldStatuses?: string,
  newStatuses?: string,
  userTypes?: string

}

export interface IHistorySort {
  changeDatetime?: "ASC" | "DESC"
  fullName?: "ASC" | "DESC"
}
