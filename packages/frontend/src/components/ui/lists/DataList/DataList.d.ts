import type { CSSProperties, ReactNode } from 'react'

export interface DataListColumn<T = any> {
  key: string
  header?: ReactNode
  minWidth?: number
  grow?: number | boolean
  align?: string
  priority?: number
  sortKey?: string
  cell?: (item: T, index?: number) => ReactNode
}

export interface DataListProps<T = any> {
  items?: T[]
  columns?: DataListColumn<T>[]
  rowHref?: (item: T) => string | undefined
  rowKey?: (item: T) => string | number
  rowClassName?: string | ((item: T, index: number) => string)
  rowStyle?: any
  loading?: boolean
  emptyMessage?: ReactNode
  headerVariant?: string
  skeletonCount?: number
  footer?: ReactNode
  className?: string
  wrapperProps?: Record<string, unknown>
  sort?: { order_by?: string, order?: string }
  onSortChange?: (sort: { order_by: string, order: string }) => void
}

export default function DataList<T = any>(props: DataListProps<T>): ReactNode
