// Mirrors packages/api/src/models/PaginatedResultSet.js
// Note: backend sets `total: -1` when the underlying resultSet is empty.

export interface Pagination {
  page: number
  limit: number
  total: number
}

export interface PaginatedResultSet<T> {
  resultSet: T[]
  pagination: Pagination
}
