'use client'

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  type RefObject
} from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp } from 'lucide-react'
import useResizeObserver from '@react-hook/resize-observer'
import { EmptyListMessage } from '../index'
import DataListHeaderMenu, {
  type DataListHeaderFilterType,
  type DataListHeaderMenuOption
} from './DataListHeaderMenu'
import type { DateRangeFilterValue, RangeFilterValue } from '../../../filters/types'
import './DataList.css'

const GAP = 16
const DEFAULT_SKELETON_ROWS = 8

export interface DataListColumn<T = any> {
  key: string
  header?: ReactNode
  minWidth?: number
  maxWidth?: number
  grow?: number | boolean
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
  onSortChange?: (sort: { order_by: string; order: string }) => void
  pinFirst?: boolean
  filterValues?: Record<string, unknown>
  onFilterChange?: (key: string, value: unknown) => void
}

function visibleColumns<T>(columns: DataListColumn<T>[], width: number, collapse: boolean) {
  if (!collapse || !width) return columns
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

function minTableWidth<T>(cols: DataListColumn<T>[]) {
  return cols.reduce((sum, c) => sum + (c.minWidth || 0), 0) + GAP * Math.max(0, cols.length - 1)
}

function colStyle<T>(column: DataListColumn<T>): CSSProperties {
  if (column.grow) return { width: 'auto' }
  if (column.maxWidth) {
    return { width: `${column.minWidth || 0}px`, maxWidth: `${column.maxWidth}px` }
  }
  if (column.minWidth) return { width: `${column.minWidth}px` }
  return {}
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

function HeadCell<T>({
  column,
  sort,
  onSortChange,
  pinned,
  filterActive,
  menuOpen,
  onMenuOpen
}: {
  column: DataListColumn<T>
  sort?: DataListProps<T>['sort']
  onSortChange?: DataListProps<T>['onSortChange']
  pinned?: boolean
  filterActive?: boolean
  menuOpen?: boolean
  onMenuOpen?: (anchor: DOMRect) => void
}) {
  const align = column.align || 'left'
  const sortKey = column.sortKey
  const sortable = Boolean(sortKey && onSortChange)
  const isActive = Boolean(sortable && sort && sort.order_by === sortKey)
  const direction = isActive ? sort?.order : null
  const pinClass = pinned ? ' DataList__HeadCell--pin' : ''
  const hasMenu = Boolean(column.filterKey && column.filterType && onMenuOpen)

  const handleSort = () => {
    const nextOrder = isActive && direction === 'desc' ? 'asc' : 'desc'
    onSortChange?.({ order_by: sortKey as string, order: nextOrder })
  }

  const menuBtn = hasMenu ? (
    <button
      type={'button'}
      className={`DataList__HeadMenuBtn${filterActive ? ' DataList__HeadMenuBtn--Filtered' : ''}${menuOpen ? ' DataList__HeadMenuBtn--Open' : ''}`}
      aria-label={`Filter: ${String(column.header ?? column.key)}`}
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
      className={`DataList__HeadCell DataList__HeadCell--${align}${pinClass}`}
      scope={'col'}
      aria-sort={sortable ? (isActive ? (direction === 'asc' ? 'ascending' : 'descending') : 'none') : undefined}
    >
      <div className={'DataList__HeadCellInner'}>
        {sortable ? (
          <button
            type={'button'}
            className={[
              'DataList__HeadCell--Sortable',
              isActive ? 'DataList__HeadCell--Active' : ''
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={handleSort}
          >
            {isActive ? (
              direction === 'asc' ? (
                <ChevronUp className={'DataList__SortIcon'} size={12} strokeWidth={2} aria-hidden />
              ) : (
                <ChevronDown className={'DataList__SortIcon'} size={12} strokeWidth={2} aria-hidden />
              )
            ) : (
              <span className={'DataList__SortSpacer'} aria-hidden />
            )}
            <span className={'DataList__HeadCellTitle'}>{column.header}</span>
          </button>
        ) : (
          <span className={'DataList__HeadCellTitle'}>{column.header}</span>
        )}
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
  onSortChange,
  pinFirst = false,
  filterValues = {},
  onFilterChange
}: DataListProps<T>) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const headScrollRef = useRef<HTMLDivElement | null>(null)
  const syncingScroll = useRef(false)
  const [width, setWidth] = useState(0)
  const [canScrollEnd, setCanScrollEnd] = useState(false)
  const [overflowX, setOverflowX] = useState(false)
  const [openMenu, setOpenMenu] = useState<{ key: string; anchor: DOMRect } | null>(null)
  const router = useRouter()
  useResizeObserver(wrapRef as RefObject<HTMLElement>, entry => setWidth(entry.contentRect.width))

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onWheel = (event: WheelEvent) => {
      const canScrollY = el.scrollHeight > el.clientHeight + 1
      if (canScrollY) return
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
      event.preventDefault()
      window.scrollBy(0, event.deltaY)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [pinFirst, items.length, loading])

  useEffect(() => {
    const body = scrollRef.current
    const head = headScrollRef.current
    if (!body || !pinFirst) {
      setCanScrollEnd(false)
      setOverflowX(false)
      return
    }
    const updateFade = () => {
      const max = body.scrollWidth - body.clientWidth
      const hasX = max > 1
      setOverflowX(hasX)
      setCanScrollEnd(hasX && body.scrollLeft < max - 8)
      if (!hasX && body.scrollLeft !== 0) {
        body.scrollLeft = 0
        if (head) head.scrollLeft = 0
      }
    }
    const onBodyScroll = () => {
      if (syncingScroll.current) return
      syncingScroll.current = true
      if (head) head.scrollLeft = body.scrollLeft
      updateFade()
      syncingScroll.current = false
    }
    const onHeadScroll = () => {
      if (!head || syncingScroll.current) return
      syncingScroll.current = true
      body.scrollLeft = head.scrollLeft
      updateFade()
      syncingScroll.current = false
    }
    const onHeadWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
      event.preventDefault()
      body.scrollTop += event.deltaY
    }
    updateFade()
    body.addEventListener('scroll', onBodyScroll, { passive: true })
    head?.addEventListener('scroll', onHeadScroll, { passive: true })
    head?.addEventListener('wheel', onHeadWheel, { passive: false })
    const ro = new ResizeObserver(updateFade)
    ro.observe(body)
    return () => {
      body.removeEventListener('scroll', onBodyScroll)
      head?.removeEventListener('scroll', onHeadScroll)
      head?.removeEventListener('wheel', onHeadWheel)
      ro.disconnect()
    }
  }, [pinFirst, items.length, loading, width])

  const cols = visibleColumns(columns, width, !pinFirst)
  const tableMinWidth = minTableWidth(cols)

  const openRow = (event: MouseEvent, href?: string) => {
    if (!href || isInteractiveTarget(event.target)) return
    if (event.metaKey || event.ctrlKey || event.button === 1) {
      window.open(href, '_blank', 'noopener,noreferrer')
      return
    }
    router.push(href)
  }

  const renderCells = (item: T | undefined, index: number, skeleton: boolean) =>
    cols.map((c, ci) => (
      <td
        key={c.key}
        className={`DataList__Cell DataList__Cell--${c.align || 'left'}${pinFirst && ci === 0 ? ' DataList__Cell--pin' : ''}`}
      >
        {skeleton ? <span className={'DataList__Skeleton'} /> : c.cell?.(item as T, index)}
      </td>
    ))

  const renderColGroup = () => (
    <colgroup>
      {cols.map(c => (
        <col key={c.key} style={colStyle(c)} />
      ))}
    </colgroup>
  )

  const headerRow =
    showHeader ? (
      <thead className={`DataList__Head DataList__Head--${headerVariant}`}>
        <tr>
          {cols.map((c, i) => (
            <HeadCell
              key={c.key}
              column={c}
              sort={sort}
              onSortChange={onSortChange}
              pinned={pinFirst && i === 0}
              filterActive={isFilterActive(c.filterType, filterValues[c.filterKey || ''])}
              menuOpen={openMenu?.key === c.key}
              onMenuOpen={
                c.filterKey && c.filterType && onFilterChange
                  ? anchor =>
                      setOpenMenu(prev => (prev?.key === c.key ? null : { key: c.key, anchor }))
                  : undefined
              }
            />
          ))}
        </tr>
      </thead>
    ) : null

  const bodyRows = (
    <tbody className={'DataList__Body'}>
      {beforeBody ? (
        <tr className={'DataList__BeforeBody'}>
          <td colSpan={Math.max(cols.length, 1)}>{beforeBody}</td>
        </tr>
      ) : null}
      {loading ? (
        Array.from({ length: skeletonCount }).map((_, i) => (
          <tr key={i} className={'DataList__Row DataList__Row--Skeleton'}>
            {renderCells(undefined, i, true)}
          </tr>
        ))
      ) : items.length === 0 ? (
        <tr className={'DataList__Empty'}>
          <td colSpan={Math.max(cols.length, 1)}>
            <EmptyListMessage>{emptyMessage}</EmptyListMessage>
          </td>
        </tr>
      ) : (
        items.map((item, i) => {
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
        })
      )}
    </tbody>
  )

  const tableStyle = { minWidth: tableMinWidth }

  return (
    <div
      ref={wrapRef}
      className={`DataList ${pinFirst ? 'DataList--pinFirst' : ''} ${overflowX ? 'DataList--overflowX' : ''} ${canScrollEnd ? 'DataList--fadeEnd' : ''} ${className}`.trim()}
      {...wrapperProps}
    >
      {pinFirst ? (
        <>
          {showHeader ? (
            <div ref={headScrollRef} className={'DataList__HeadScroll'}>
              <table className={'DataList__Table DataList__Table--head'} style={tableStyle}>
                {renderColGroup()}
                {headerRow}
              </table>
            </div>
          ) : null}
          <div ref={scrollRef} className={'DataList__BodyScroll pe-QuietScroll'}>
            <table className={'DataList__Table DataList__Table--body'} style={tableStyle}>
              {renderColGroup()}
              {bodyRows}
            </table>
          </div>
        </>
      ) : (
        <div ref={scrollRef} className={'DataList__Scroll'}>
          <table className={'DataList__Table'} style={tableStyle}>
            {renderColGroup()}
            {headerRow}
            {bodyRows}
          </table>
        </div>
      )}

      {openMenu &&
        (() => {
          const column = cols.find(c => c.key === openMenu.key)
          if (!column?.filterKey || !column.filterType || !onFilterChange) return null
          return (
            <DataListHeaderMenu
              anchor={openMenu.anchor}
              filterType={column.filterType}
              value={filterValues[column.filterKey]}
              options={column.filterOptions}
              placeholder={column.filterPlaceholder}
              onChange={next => onFilterChange(column.filterKey as string, next)}
              onClose={() => setOpenMenu(null)}
            />
          )
        })()}

      {footer && <div className={'DataList__Footer'}>{footer}</div>}
    </div>
  )
}
