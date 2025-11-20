export interface IHistoryFilters {
  oldStatuses?: string,
  newStatuses?: string,
  sortField?: string,
  sortOrder?: "ASC" | "DECS",
  userTypes?: string
}

export interface IHistorySort {
  changeDatetime?: "ASC" | "DESC"
  fullName?: "ASC" | "DESC"
}
