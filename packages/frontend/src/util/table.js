export const normalizePagination = ({ total, page, pageSize, ...other }) => {
  const unknown = total === -1 || total == null
  const safePage = Math.max(1, Number(page) || 1)
  const safePageSize = Math.max(1, Number(pageSize) || 1)

  if (unknown) {
    return {
      unknownTotal: true,
      pageCount: 1,
      forcePage: 0,
      ...other
    }
  }

  const pageCount = Math.max(1, Math.ceil(total / safePageSize))

  return {
    unknownTotal: false,
    pageCount,
    forcePage: Math.max(0, Math.min(pageCount - 1, safePage - 1)),
    ...other
  }
}
