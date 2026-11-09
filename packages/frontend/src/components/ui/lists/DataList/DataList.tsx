'use client'

import { useEffect, useRef, useState, type MouseEvent, type ReactNode, type RefObject } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, X } from 'lucide-react'
import { DataListPageFooter, DataListPagingBar, type DataListPagingConfig } from './DataListPaging'
import useResizeObserver from '@react-hook/resize-observer'
import { EmptyListMessage } from '../index'
import DataListHeaderMenu, {
  type DataListHeaderFilterType,
  type DataListHeaderMenuOption
} from './DataListHeaderMenu'
import type { DateRangeFilterValue, RangeFilterValue } from '../../../filters/types'
import './DataList.css'

const COMPACT_FIRST_MAX = 768
const DEFAULT_SKELETON_ROWS = 8
const APPEND_SKELETON_ROWS = 4

export interface DataListColumn<T = any> {
  key: string
  header?: ReactNode
  minWidth?: number
  maxWidth?: number
  grow?: number | boolean
  numeric?: boolean
  align?: string
  priority?: number
  sortKey?: string
  filterKey?: string
  filterType?: DataListHeaderFilterType
  filterOptions?: DataListHeaderMenuOption[]
  filterPlaceholder?: string
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
  beforeBody?: ReactNode
  showHeader?: boolean
  className?: string
  wrapperProps?: Record<string, unknown>
  sort?: { order_by?: string; order?: string }
  sortDefault?: { order_by: string; order: string }
  onSortChange?: (sort: { order_by: string; order: string }) => void
  pinFirst?: boolean
  fit?: 'page' | 'feed'
  filterValues?: Record<string, unknown>
  onFilterChange?: (key: string, value: unknown) => void
  title?: ReactNode
  titleExtra?: ReactNode
  paging?: DataListPagingConfig
}

function resolveRowClassName<T>(
  rowClassName: DataListProps<T>['rowClassName'],
  item: T,
  index: number
) {
  if (!rowClassName) return ''
  return typeof rowClassName === 'function' ? rowClassName(item, index) || '' : rowClassName
}

function isFilterActive(type: DataListHeaderFilterType | undefined, value: unknown) {
  if (!type || value == null || value === '') return false
  if (type === 'range') {
    const range = value as RangeFilterValue
    return Boolean(range?.min || range?.max)
  }
  if (type === 'daterange') {
    const range = value as DateRangeFilterValue
    return Boolean(range?.start || range?.end)
  }
  if (type === 'options') return Array.isArray(value) && value.length > 0
  return String(value).length > 0
}

function emptyFilterValue(type: DataListHeaderFilterType | undefined): unknown {
  if (type === 'range') return { min: '', max: '' }
  if (type === 'daterange') return { start: null, end: null }
  if (type === 'options') return []
  return ''
}

function formatChipDate(value: unknown): string {
  const date = value instanceof Date ? value : new Date(String(value))
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function compactCount(value: number) {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(
    value
  )
}

function formatFilterChip(type: DataListHeaderFilterType | undefined, value: unknown): string {
  if (type === 'range') {
    const range = value as RangeFilterValue
    const min = range?.min != null && range.min !== '' ? String(range.min) : '…'
    const max = range?.max != null && range.max !== '' ? String(range.max) : '…'
    return `${min}–${max}`
  }
  if (type === 'daterange') {
    const range = value as DateRangeFilterValue
    const start = formatChipDate(range?.start)
    const end = formatChipDate(range?.end)
    if (start && end && start === end) return start
    if (start && end) return `${start} – ${end}`
    return start || end
  }
  if (type === 'options' && Array.isArray(value)) return value.join(', ')
  return String(value ?? '')
}

function formatSortChip(order?: string) {
  return order === 'asc' ? 'Low to high' : 'High to low'
}

function HeadCell<T>({
  column,
  sort,
  onSortChange,
  filterActive,
  menuOpen,
  onMenuOpen
}: {
  column: DataListColumn<T>
  sort?: DataListProps<T>['sort']
  onSortChange?: DataListProps<T>['onSortChange']
  filterActive?: boolean
  menuOpen?: boolean
  onMenuOpen?: (anchor: DOMRect) => void
}) {
  const align = column.numeric ? 'right' : column.align || 'left'
  const sortKey = column.sortKey
  const sortable = Boolean(sortKey && onSortChange)
  const isActive = Boolean(sortable && sort && sort.order_by === sortKey)
  const direction = isActive ? sort?.order : null
  const hasMenu = Boolean(onMenuOpen)

  const menuBtn = hasMenu ? (
    <button
      type={'button'}
      className={`DataList__HeadMenuBtn${filterActive || isActive ? ' DataList__HeadMenuBtn--Filtered' : ''}${menuOpen ? ' DataList__HeadMenuBtn--Open' : ''}`}
      aria-label={`${sortable ? 'Sort and filter' : 'Filter'}: ${String(column.header ?? column.key)}`}
      onClick={event => {
        event.stopPropagation()
        onMenuOpen?.(event.currentTarget.getBoundingClientRect())
      }}
    >
      <ChevronDown className={'DataList__HeadMenuIcon'} size={12} strokeWidth={2} aria-hidden />
    </button>
  ) : null

  return (
    <th
      className={`DataList__HeadCell DataList__HeadCell--${align}`}
      style={{ minWidth: column.minWidth }}
      scope={'col'}
      aria-sort={
        sortable
          ? isActive
            ? direction === 'asc'
              ? 'ascending'
              : 'descending'
            : 'none'
          : undefined
      }
    >
      <div className={'DataList__HeadCellInner'}>
        <span className={'DataList__HeadCellTitle'}>{column.header}</span>
        {menuBtn}
      </div>
    </th>
  )
}

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false
  return Boolean(target.closest('a, button, input, textarea, select, [role="button"]'))
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
  beforeBody,
  showHeader = true,
  className = '',
  wrapperProps = {},
  sort,
  sortDefault,
  onSortChange,
  pinFirst = false,
  fit = 'page',
  filterValues = {},
  onFilterChange,
  title,
  titleExtra,
  paging
}: DataListProps<T>) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const [width, setWidth] = useState(0)
  const [canScrollEnd, setCanScrollEnd] = useState(false)
  const [overflowX, setOverflowX] = useState(false)
  const [fillRows, setFillRows] = useState(() => Math.max(skeletonCount, paging?.pageSize || 0))
  const [openMenu, setOpenMenu] = useState<{ key: string; anchor: DOMRect } | null>(null)
  const router = useRouter()
  useResizeObserver(wrapRef as RefObject<HTMLElement>, entry => setWidth(entry.contentRect.width))

  useEffect(() => {
    const body = scrollRef.current
    if (!body) {
      setCanScrollEnd(false)
      setOverflowX(false)
      return
    }
    const updateFade = () => {
      const max = body.scrollWidth - body.clientWidth
      const hasX = max > 1
      setOverflowX(hasX)
      setCanScrollEnd(hasX && body.scrollLeft < max - 8)
      if (fit === 'feed') return
      setFillRows(Math.max(skeletonCount, paging?.pageSize || 0))
    }
    updateFade()
    body.addEventListener('scroll', updateFade, { passive: true })
    const ro = new ResizeObserver(updateFade)
    ro.observe(body)
    return () => {
      body.removeEventListener('scroll', updateFade)
      ro.disconnect()
    }
  }, [pinFirst, fit, items.length, loading, width, skeletonCount, paging?.pageSize])

  const replacePending = Boolean(loading && (items.length === 0 || paging?.mode !== 'continuous'))
  const isFeed = fit === 'feed'
  const compactFirst = !isFeed && width > 0 && width <= COMPACT_FIRST_MAX
  const fillList = pinFirst && !isFeed
  const cols = columns

  const openRow = (event: MouseEvent, href?: string) => {
    if (!href || isInteractiveTarget(event.target)) return
    if (event.metaKey || event.ctrlKey || event.button === 1) {
      window.open(href, '_blank', 'noopener,noreferrer')
      return
    }
    router.push(href)
  }

  const renderCells = (item: T | undefined, index: number, skeleton: boolean) =>
    cols.map(c => (
      <td
        key={c.key}
        style={{ minWidth: c.minWidth }}
        className={`DataList__Cell DataList__Cell--${c.numeric ? 'right' : c.align || 'left'}${c.numeric ? ' DataList__Cell--numeric' : ''}${c.grow ? ' DataList__Cell--grow' : ' DataList__Cell--compact'}`}
      >
        <div className={'DataList__CellContent'}>
          <div style={{ maxWidth: c.maxWidth }}>
            {skeleton ? <span className={'DataList__Skeleton'} /> : c.cell?.(item as T, index)}
          </div>
        </div>
      </td>
    ))

  const headerRow = showHeader ? (
    <thead className={`DataList__Head DataList__Head--${headerVariant}`}>
      <tr>
        {cols.map((c, i) => (
          <HeadCell
            key={c.key}
            column={c}
            sort={sort}
            onSortChange={onSortChange}
            filterActive={isFilterActive(c.filterType, filterValues[c.filterKey || ''])}
            menuOpen={openMenu?.key === c.key}
            onMenuOpen={
              (c.filterKey && c.filterType && onFilterChange) || (c.sortKey && onSortChange)
                ? anchor =>
                    setOpenMenu(prev => (prev?.key === c.key ? null : { key: c.key, anchor }))
                : undefined
            }
          />
        ))}
      </tr>
    </thead>
  ) : null

  const replaceSkeletonCount =
    fillList && !compactFirst ? fillRows : Math.max(1, paging?.pageSize || skeletonCount)
  const renderSkeletonRows = (count: number, prefix: string) =>
    Array.from({ length: count }).map((_, i) => (
      <tr key={`${prefix}-${i}`} className={'DataList__Row DataList__Row--Skeleton'}>
        {renderCells(undefined, i, true)}
      </tr>
    ))
  const replaceSkeleton = replacePending
  const appendSkeleton = Boolean(paging?.mode === 'continuous' && paging.loadingMore)

  const bodyRows = (
    <tbody className={'DataList__Body'}>
      {beforeBody ? (
        <tr className={'DataList__BeforeBody'}>
          <td colSpan={Math.max(cols.length, 1)}>{beforeBody}</td>
        </tr>
      ) : null}
      {replaceSkeleton ? (
        renderSkeletonRows(replaceSkeletonCount, 'sk')
      ) : items.length === 0 ? (
        <tr className={'DataList__Empty'}>
          <td colSpan={Math.max(cols.length, 1)}>
            <EmptyListMessage>{emptyMessage}</EmptyListMessage>
          </td>
        </tr>
      ) : (
        <>
          {items.map((item, i) => {
            const key = rowKey ? rowKey(item, i) : i
            const extraRowClass = resolveRowClassName(rowClassName, item, i)
            const extraRowStyle =
              typeof rowStyle === 'function' ? rowStyle(item, i) || {} : rowStyle || {}
            const href = rowHref?.(item, i)
            return (
              <tr
                key={key}
                className={`DataList__Row${href ? ' DataList__Row--link' : ''}${extraRowClass ? ` ${extraRowClass}` : ''}`}
                style={extraRowStyle}
                onClick={href ? e => openRow(e, href) : undefined}
                onAuxClick={href ? e => openRow(e, href) : undefined}
                onKeyDown={
                  href
                    ? e => {
                        if (e.key !== 'Enter' && e.key !== ' ') return
                        if (isInteractiveTarget(e.target)) return
                        e.preventDefault()
                        router.push(href)
                      }
                    : undefined
                }
                tabIndex={href ? 0 : undefined}
              >
                {renderCells(item, i, false)}
              </tr>
            )
          })}
          {appendSkeleton ? renderSkeletonRows(APPEND_SKELETON_ROWS, 'more') : null}
        </>
      )}
    </tbody>
  )

  const isEmpty = !loading && items.length === 0 && !replacePending
  const showCenteredEmpty = compactFirst && isEmpty
  const canFilter = Boolean(onFilterChange && cols.some(column => column.filterKey))
  const activeFilters = canFilter
    ? cols.filter(c => c.filterKey && isFilterActive(c.filterType, filterValues[c.filterKey]))
    : []
  const sortColumn = sort?.order_by
    ? cols.find(column => column.sortKey && column.sortKey === sort.order_by)
    : undefined
  const isCustomSort = Boolean(
    sortColumn &&
      sort?.order_by &&
      (!sortDefault || sort.order_by !== sortDefault.order_by || sort.order !== sortDefault.order)
  )

  return (
    <div
      ref={wrapRef}
      className={`DataList ${fillList ? 'DataList--fill' : ''} ${compactFirst ? 'DataList--compactFirst' : ''} ${isFeed ? 'DataList--feed' : ''} ${showCenteredEmpty ? 'DataList--empty' : ''} ${loading || paging?.loadingMore ? 'DataList--loading' : ''} ${overflowX && !showCenteredEmpty && !isFeed ? 'DataList--overflowX' : ''} ${canScrollEnd && !showCenteredEmpty && !isFeed ? 'DataList--fadeEnd' : ''} ${className}`.trim()}
      aria-busy={loading || paging?.loadingMore ? true : undefined}
      {...wrapperProps}
    >
      {canFilter || title || paging ? (
        <div className={'DataList__FilterBar'}>
          {title ? (
            <div className={'DataList__TitleRow'}>
              <h1 className={'DataList__Title'}>{title}</h1>
              {paging && paging.total > 0 ? (
                <span className={'DataList__Total'} title={paging.total.toLocaleString('en-US')}>
                  {compactCount(paging.total)}
                </span>
              ) : null}
              {titleExtra ? <div className={'DataList__TitleExtra'}>{titleExtra}</div> : null}
            </div>
          ) : (
            <span />
          )}
          <div
            className={`DataList__FilterChips${
              activeFilters.length > 0 || isCustomSort ? '' : ' DataList__FilterChips--Empty'
            }`}
          >
            {isCustomSort ? (
              <button
                type={'button'}
                className={'DataList__FilterChip'}
                aria-label={`Clear sort: ${String(sortColumn?.header)} ${formatSortChip(sort?.order)}`}
                onClick={() => {
                  if (!sortDefault || !onSortChange) return
                  onSortChange(sortDefault)
                }}
              >
                <span className={'DataList__FilterChipLabel'}>
                  Sort: {String(sortColumn?.header)} · {formatSortChip(sort?.order)}
                </span>
                <X size={10} strokeWidth={2.5} aria-hidden />
              </button>
            ) : null}
            {activeFilters.map(column => {
              const key = column.filterKey as string
              return (
                <button
                  type={'button'}
                  key={key}
                  className={'DataList__FilterChip'}
                  onClick={() => onFilterChange?.(key, emptyFilterValue(column.filterType))}
                >
                  <span className={'DataList__FilterChipLabel'}>
                    {column.header}: {formatFilterChip(column.filterType, filterValues[key])}
                  </span>
                  <X size={10} strokeWidth={2.5} aria-hidden />
                </button>
              )
            })}
            {activeFilters.length > 0 || isCustomSort ? (
              <button
                type={'button'}
                className={'DataList__FilterChip DataList__FilterChip--Clear'}
                onClick={() => {
                  activeFilters.forEach(column => {
                    if (column.filterKey) {
                      onFilterChange?.(column.filterKey, emptyFilterValue(column.filterType))
                    }
                  })
                  if (sortDefault && onSortChange) onSortChange(sortDefault)
                }}
              >
                Clear
              </button>
            ) : null}
          </div>
          {paging && !showCenteredEmpty ? (
            <DataListPagingBar
              paging={paging}
              itemCount={items.length}
              scrollRef={scrollRef}
              sentinelRef={sentinelRef}
              loading={loading}
              pageScroll={true}
            />
          ) : null}
        </div>
      ) : null}
      <div ref={scrollRef} className={'DataList__Scroll pe-QuietScroll'}>
        {showCenteredEmpty ? (
          <EmptyListMessage>{emptyMessage}</EmptyListMessage>
        ) : (
          <>
            <table className={'DataList__Table'}>
              {headerRow}
              {bodyRows}
            </table>
            {paging?.mode === 'continuous' && (paging.hasMore ?? items.length < paging.total) ? (
              <div ref={sentinelRef} className={'DataList__Sentinel'} />
            ) : null}
          </>
        )}
      </div>

      {openMenu &&
        (() => {
          const column = cols.find(c => c.key === openMenu.key)
          if (!column) return null
          const canFilterColumn = Boolean(column.filterKey && column.filterType && onFilterChange)
          const canSortColumn = Boolean(column.sortKey && onSortChange)
          if (!canFilterColumn && !canSortColumn) return null
          return (
            <DataListHeaderMenu
              anchor={openMenu.anchor}
              filterType={canFilterColumn ? column.filterType : undefined}
              value={canFilterColumn ? filterValues[column.filterKey as string] : undefined}
              options={column.filterOptions}
              placeholder={column.filterPlaceholder}
              onChange={
                canFilterColumn
                  ? next => onFilterChange?.(column.filterKey as string, next)
                  : undefined
              }
              sortKey={canSortColumn ? column.sortKey : undefined}
              sortOrder={
                canSortColumn && column.sortKey && sort?.order_by === column.sortKey
                  ? sort.order
                  : undefined
              }
              onSortChange={
                canSortColumn
                  ? order => onSortChange?.({ order_by: column.sortKey as string, order })
                  : undefined
              }
              onClose={() => setOpenMenu(null)}
            />
          )
        })()}

      {paging && !showCenteredEmpty ? (
        <DataListPageFooter paging={paging} loading={loading} />
      ) : null}
      {footer && <div className={'DataList__Footer'}>{footer}</div>}
    </div>
  )
}
