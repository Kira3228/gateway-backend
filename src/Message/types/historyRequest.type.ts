export interface HistoryRequestParams {
  id: string
}
export interface HistoryRequestQuery {
  oldStatuses: string
  newStatuses: string
  userType: string
  page: number
  limit: number
  changeDatetime: 'ASC' | 'DESC' | ''
}