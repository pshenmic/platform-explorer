'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import { Check, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import type { ListScrollMode } from './listScrollMode'

const DEFAULT_PAGE_SIZES = [10, 25, 50, 75, 100]

export type DataListPagingConfig = {
  mode: ListScrollMode
  onModeChange: (mode: ListScrollMode) => void
  total: number
  pageSize: number
  page: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeValues?: number[]
  onLoadMore: () => void
  loadingMore?: boolean
  hasMore?: boolean
}

function buildPageList(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '...')[] = [1]
  if (current > 3) pages.push('...')
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}

export function DataListPagingBar({
  paging,
  itemCount,
  scrollRef,
  sentinelRef,
  loading,
  pageScroll = false
}: {
  paging: DataListPagingConfig
  itemCount: number
  scrollRef: RefObject<HTMLDivElement | null>
  sentinelRef: RefObject<HTMLDivElement | null>
  loading: boolean
  pageScroll?: boolean
}) {
  const loadLock = useRef(false)
  const onLoadMoreRef = useRef(paging.onLoadMore)
  onLoadMoreRef.current = paging.onLoadMore

  const mode = paging.mode
  const loadingMore = Boolean(paging.loadingMore)
  const hasMore = paging.hasMore ?? itemCount < paging.total
  const continuous = mode === 'continuous'

  useEffect(() => {
    if (!loadingMore) loadLock.current = false
  }, [loadingMore])

  useEffect(() => {
    if (!continuous || loadingMore || loading || !hasMore) return
    const root = pageScroll ? null : scrollRef.current
    const sentinel = sentinelRef.current
    if ((!pageScroll && !root) || !sentinel) return
    const observer = new IntersectionObserver(
      entries => {
        if (!entries[0]?.isIntersecting) return
        if (loadLock.current) return
        loadLock.current = true
        onLoadMoreRef.current()
      },
      { root, rootMargin: pageScroll ? '80px' : '200px', threshold: 0 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [continuous, loadingMore, loading, hasMore, scrollRef, sentinelRef, pageScroll])

  return (
    <div className={'DataList__StatusBar'}>
      <div className={'DataList__ModeSwitch'} role={'group'} aria-label={'List view'}>
        <button
          type={'button'}
          className={`DataList__ModeBtn${continuous ? ' DataList__ModeBtn--On' : ''}`}
          onClick={() => paging.onModeChange('continuous')}
        >
          Scroll
        </button>
        <button
          type={'button'}
          className={`DataList__ModeBtn${mode === 'pages' ? ' DataList__ModeBtn--On' : ''}`}
          onClick={() => paging.onModeChange('pages')}
        >
          Pages
        </button>
      </div>
    </div>
  )
}

export function DataListPageFooter({
  paging,
  loading
}: {
  paging: DataListPagingConfig
  loading: boolean
}) {
  if (paging.mode !== 'pages' || paging.total <= 0) return null

  const pageCount = Math.max(1, Math.ceil(paging.total / Math.max(1, paging.pageSize)))
  const current = paging.page + 1
  const pageList = buildPageList(current, pageCount)
  const sizes = paging.pageSizeValues?.length ? paging.pageSizeValues : DEFAULT_PAGE_SIZES
  const go = (next: number) => paging.onPageChange(Math.max(0, Math.min(pageCount - 1, next - 1)))

  return (
    <div className={'DataList__Pager'}>
      <div className={'DataList__PagerMeta'}>
        <span className={'DataList__PagerPage'}>
          Page <strong>{current.toLocaleString('en-US')}</strong>
          <span className={'DataList__PagerOf'}> of {pageCount.toLocaleString('en-US')}</span>
        </span>
        <span className={'DataList__PagerDot'} aria-hidden />
        <span className={'DataList__PagerTotal'}>{paging.total.toLocaleString('en-US')} total</span>
        {paging.onPageSizeChange ? (
          <PagerRowsSelect
            value={paging.pageSize}
            sizes={sizes}
            disabled={loading}
            onChange={paging.onPageSizeChange}
          />
        ) : null}
      </div>
      <nav className={'DataList__PagerNav'} aria-label={'Pagination'}>
        <button
          type={'button'}
          className={'DataList__PagerBtn DataList__PagerBtn--Wide'}
          aria-label={'Previous page'}
          disabled={current <= 1 || loading}
          onClick={() => go(current - 1)}
        >
          <ChevronLeft size={14} strokeWidth={2} aria-hidden />
          <span>Previous</span>
        </button>
        {pageList.map((item, i) =>
          item === '...' ? (
            <span key={`e-${i}`} className={'DataList__PagerEllipsis'} aria-hidden>
              <MoreHorizontal size={14} strokeWidth={2} />
              <span className={'DataList__PagerSr'}>More pages</span>
            </span>
          ) : (
            <button
              type={'button'}
              key={item}
              className={`DataList__PagerBtn${item === current ? ' DataList__PagerBtn--On' : ''}`}
              aria-current={item === current ? 'page' : undefined}
              disabled={loading}
              onClick={() => go(item)}
            >
              {item.toLocaleString('en-US')}
            </button>
          )
        )}
        <button
          type={'button'}
          className={'DataList__PagerBtn DataList__PagerBtn--Wide'}
          aria-label={'Next page'}
          disabled={current >= pageCount || loading}
          onClick={() => go(current + 1)}
        >
          <span>Next</span>
          <ChevronRight size={14} strokeWidth={2} aria-hidden />
        </button>
      </nav>
    </div>
  )
}

function PagerRowsSelect({
  value,
  sizes,
  disabled,
  onChange
}: {
  value: number
  sizes: number[]
  disabled?: boolean
  onChange: (size: number) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className={'DataList__PagerRows'} ref={rootRef}>
      <span className={'DataList__PagerRowsLabel'}>Rows</span>
      <button
        type={'button'}
        className={'DataList__PagerSelect'}
        aria-haspopup={'listbox'}
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen(v => !v)}
      >
        {value}
        <ChevronDown size={14} strokeWidth={2} aria-hidden />
      </button>
      {open ? (
        <div className={'DataList__PagerMenu'} role={'listbox'} aria-label={'Rows'}>
          {sizes.map(size => (
            <button
              type={'button'}
              key={size}
              role={'option'}
              aria-selected={size === value}
              className={`DataList__PagerOption${size === value ? ' DataList__PagerOption--On' : ''}`}
              onClick={() => {
                onChange(size)
                setOpen(false)
              }}
            >
              <span>{size}</span>
              {size === value ? <Check size={14} strokeWidth={2} aria-hidden /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
