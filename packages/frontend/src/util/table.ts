interface NormalizePaginationInput {
  total?: number | null
  page?: number | string
  pageSize?: number | string
  [key: string]: unknown
}

export const normalizePagination = ({ total, page, pageSize, ...other }: NormalizePaginationInput) => {
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

  const pageCount = Math.max(1, Math.ceil(Number(total) / safePageSize))

  return {
    unknownTotal: false,
    pageCount,
    forcePage: Math.max(0, Math.min(pageCount - 1, safePage - 1)),
    ...other
  }
}
