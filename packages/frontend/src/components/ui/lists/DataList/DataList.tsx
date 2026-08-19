'use client'

import { useRef, useState, type CSSProperties, type ReactNode } from 'react'
import Link from 'next/link'
import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons'
import useResizeObserver from '@react-hook/resize-observer'
import { EmptyListMessage } from '../index'
import './DataList.css'

const GAP = 16
const DEFAULT_SKELETON_ROWS = 8

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
  rowHref?: (item: T, index?: number) => string | undefined
  rowKey?: (item: T, index?: number) => string | number
  rowClassName?: string | ((item: T, index: number) => string)
  rowStyle?: any
  loading?: boolean
  emptyMessage?: ReactNode
  headerVariant?: string
  skeletonCount?: number
  footer?: ReactNode
  className?: string
  wrapperProps?: Record<string, unknown>
  sort?: { order_by?: string; order?: string }
  onSortChange?: (sort: { order_by: string; order: string }) => void
}

function visibleColumns<T>(columns: DataListColumn<T>[], width: number) {
  if (!width) return columns
  const fits = (cols: DataListColumn<T>[]) =>
    cols.reduce((sum, c) => sum + (c.minWidth || 0), 0) + GAP * Math.max(0, cols.length - 1) <=
    width
  const kept = [...columns]
  const droppable = () =>
    kept
      .map((c, i) => ({ c, i }))
      .filter(({ c }) => typeof c.priority === 'number')
      .sort((a, b) => (a.c.priority ?? 0) - (b.c.priority ?? 0))
  while (!fits(kept) && droppable().length) {
    kept.splice(droppable()[0].i, 1)
  }
  return kept
}

function templateFor<T>(cols: DataListColumn<T>[]) {
  return cols
    .map(c => (c.grow ? `minmax(0, ${Number(c.grow) || 1}fr)` : `minmax(0, ${c.minWidth}px)`))
    .join(' ')
}

function resolveRowClassName<T>(
  rowClassName: DataListProps<T>['rowClassName'],
  item: T,
  index: number
) {
  if (!rowClassName) return ''
  return typeof rowClassName === 'function' ? rowClassName(item, index) || '' : rowClassName
}

function HeadCell<T>({
  column,
  sort,
  onSortChange
}: {
  column: DataListColumn<T>
  sort?: DataListProps<T>['sort']
  onSortChange?: DataListProps<T>['onSortChange']
}) {
  const align = column.align || 'left'
  const sortKey = column.sortKey
  const sortable = Boolean(sortKey && onSortChange)
  const isActive = Boolean(sortable && sort && sort.order_by === sortKey)
  const direction = isActive ? sort?.order : null

  if (!sortable) {
    return <div className={`DataList__HeadCell DataList__HeadCell--${align}`}>{column.header}</div>
  }

  const handleClick = () => {
    const nextOrder = isActive && direction === 'desc' ? 'asc' : 'desc'
    onSortChange?.({ order_by: sortKey as string, order: nextOrder })
  }

  return (
    <button
      type={'button'}
      className={[
        'DataList__HeadCell',
        `DataList__HeadCell--${align}`,
        'DataList__HeadCell--Sortable',
        isActive ? 'DataList__HeadCell--Active' : ''
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={handleClick}
      aria-sort={isActive ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      {isActive ? (
        direction === 'asc' ? (
          <ChevronUpIcon className={'DataList__SortIcon'} w={3.5} h={3.5} aria-hidden />
        ) : (
          <ChevronDownIcon className={'DataList__SortIcon'} w={3.5} h={3.5} aria-hidden />
        )
      ) : (
        <span className={'DataList__SortSpacer'} aria-hidden />
      )}
      <span>{column.header}</span>
    </button>
  )
}

export default function DataList<T = any>({
  items = [],
  columns = [],
  rowHref,
  rowKey,
  rowClassName,
  rowStyle,
  loading = false,
  emptyMessage = 'No data',
  headerVariant = 'default',
  skeletonCount = DEFAULT_SKELETON_ROWS,
  footer,
  className = '',
  wrapperProps = {},
  sort,
  onSortChange
}: DataListProps<T>) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [width, setWidth] = useState(0)
  useResizeObserver(wrapRef, entry => setWidth(entry.contentRect.width))

  const cols = visibleColumns(columns, width)
  const template = templateFor(cols)

  return (
    <div ref={wrapRef} className={`DataList ${className}`.trim()} {...wrapperProps}>
      <div
        className={`DataList__Head DataList__Head--${headerVariant}`}
        style={{ gridTemplateColumns: template }}
      >
        {cols.map(c => (
          <HeadCell key={c.key} column={c} sort={sort} onSortChange={onSortChange} />
        ))}
      </div>

      <div className={'DataList__Body'}>
        {loading ? (
          Array.from({ length: skeletonCount }).map((_, i) => (
            <div
              key={i}
              className={'DataList__Row DataList__Row--Skeleton'}
              style={{ gridTemplateColumns: template }}
            >
              {cols.map(c => (
                <div key={c.key} className={'DataList__Cell'}>
                  <span className={'DataList__Skeleton'} />
                </div>
              ))}
            </div>
          ))
        ) : items.length === 0 ? (
          <EmptyListMessage>{emptyMessage}</EmptyListMessage>
        ) : (
          items.map((item, i) => {
            const key = rowKey ? rowKey(item, i) : i
            const extraRowClass = resolveRowClassName(rowClassName, item, i)
            const extraRowStyle =
              typeof rowStyle === 'function' ? rowStyle(item, i) || {} : rowStyle || {}
            const cells = cols.map(c => (
              <div key={c.key} className={`DataList__Cell DataList__Cell--${c.align || 'left'}`}>
                {c.cell?.(item, i)}
              </div>
            ))
            const inner = (
              <div
                key={key}
                className={`DataList__Row${extraRowClass ? ` ${extraRowClass}` : ''}`}
                style={{ gridTemplateColumns: template, ...extraRowStyle }}
              >
                {cells}
              </div>
            )
            return rowHref ? (
              <Link
                key={key}
                href={rowHref(item, i) || '#'}
                prefetch={false}
                className={'DataList__RowLink'}
              >
                {inner}
              </Link>
            ) : (
              <div key={key} className={'DataList__RowStatic'}>
                {inner}
              </div>
            )
          })
        )}
      </div>

      {footer && <div className={'DataList__Footer'}>{footer}</div>}
    </div>
  )
}
