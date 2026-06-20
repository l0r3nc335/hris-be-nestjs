export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
}

export interface PaginatedResponseDto<T> {
  data: T[];
  meta: PaginatedMeta;
}
