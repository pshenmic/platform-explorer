module.exports = class PaginatedResultSet {
  resultSet
  pagination

  constructor (resultSet, page, limit, total) {
    this.resultSet = resultSet
    this.pagination = { page, limit, total: resultSet.length ? total : -1 }
  }
}
