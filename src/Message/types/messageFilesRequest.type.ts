export interface MessageFilesRequestParam {
  id: string
}
export interface MessageFilesRequestQuery {
  limit: number
  page: number
  createdAtOrder: `ASC` | `DESC` | ""
  fileNameOrder: `ASC` | `DESC` | ""
  fileSizeBytesOrder: `ASC` | `DESC` | ""
}