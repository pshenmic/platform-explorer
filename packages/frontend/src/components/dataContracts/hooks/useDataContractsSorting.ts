import { useQueryState } from 'nuqs'

export interface DataContractsSorting {
  order: string
  orderBy: string
}

export type DataContractsSortingUpdate = {
  order?: string | null
  order_by?: string | null
}

export const useDataContractsSorting = () => {
  const [order, setOrder] = useQueryState('order', { defaultValue: 'desc', scroll: false, shallow: true })
  const [orderBy, setOrderBy] = useQueryState('order_by', { defaultValue: 'block_height', scroll: false, shallow: true })

  const sorting: DataContractsSorting = {
    order: order ?? 'desc',
    orderBy: orderBy ?? 'block_height'
  }

  const setSorting = (next: DataContractsSortingUpdate | null | undefined) => {
    if (next?.order !== undefined) setOrder(next.order || null)
    if (next?.order_by !== undefined) setOrderBy(next.order_by || null)
  }

  return { sorting, setSorting }
}
