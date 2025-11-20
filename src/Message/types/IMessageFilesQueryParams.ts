export interface IMessageFilesQueryParams {
  page?: number
  limit?: number
  fileNameOrder?: "ASC" | "DESC" | ""
  fileSizeBytesOrder?: "ASC" | "DESC" | ""
  createdAtOrder?: "ASC" | "DESC" | ""
  searchStreinf?: string
}