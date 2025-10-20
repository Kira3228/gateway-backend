export interface PaginatedResult<T> {
  [key: string]: T[] | number;
  page: number
  totalPages: number;
  totalCount: number;
  limit: number
}