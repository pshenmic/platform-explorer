import { useQueryState } from 'nuqs'

export const useTokensSorting = () => {
  const [order, setOrder] = useQueryState('order', { defaultValue: 'desc', scroll: false, shallow: true })
  const [orderBy, setOrderBy] = useQueryState('order_by', { defaultValue: 'timestamp', scroll: false, shallow: true })

  const sorting = {
    order: order ?? 'desc',
    orderBy: orderBy ?? 'timestamp'
  }

  const setSorting = (next) => {
    if (next?.order !== undefined) setOrder(next.order || null)
    if (next?.order_by !== undefined) setOrderBy(next.order_by || null)
  }

  return { sorting, setSorting }
}
