export interface Pagination<T> {
  page: number;
  limit: number;
  total: number;
  data: T[];
}
