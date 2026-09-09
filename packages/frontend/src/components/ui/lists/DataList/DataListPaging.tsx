'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ListScrollMode } from './listScrollMode'

const AUTO_LOAD_PAGES = 5

export type DataListPagingConfig = {
  mode: ListScrollMode
  onModeChange: (mode: ListScrollMode) => void
  total: number
  pageSize: number
  page: number
  onPageChange: (page: number) => void
  onLoadMore: () => void
  loadingMore?: boolean
  hasMore?: boolean
}

function formatCount(value: number) {
  return value.toLocaleString('en-US')
}

export function DataListPagingBar({
  paging,
  itemCount,
  scrollRef,
  sentinelRef,
  loading
}: {
  paging: DataListPagingConfig
  itemCount: number
  scrollRef: RefObject<HTMLDivElement | null>
  sentinelRef: RefObject<HTMLTableRowElement | null>
  loading: boolean
}) {
  const [autoLeft, setAutoLeft] = useState(AUTO_LOAD_PAGES)
  const loadLock = useRef(false)
  const onLoadMoreRef = useRef(paging.onLoadMore)
  onLoadMoreRef.current = paging.onLoadMore

  const mode = paging.mode
  const page = paging.page
  const pageSize = paging.pageSize
  const total = paging.total
  const loadingMore = Boolean(paging.loadingMore)
  const hasMore = paging.hasMore ?? itemCount < total
  const continuous = mode === 'continuous'

  useEffect(() => {
    if (page === 0) setAutoLeft(AUTO_LOAD_PAGES)
  }, [mode, pageSize, page])

  useEffect(() => {
    if (!loadingMore) loadLock.current = false
  }, [loadingMore])

  useEffect(() => {
    if (!continuous || loadingMore || loading || autoLeft <= 0 || !hasMore) return
    const root = scrollRef.current
    const sentinel = sentinelRef.current
    if (!root || !sentinel) return
    const observer = new IntersectionObserver(
      entries => {
        if (!entries[0]?.isIntersecting) return
        if (loadLock.current) return
        loadLock.current = true
        onLoadMoreRef.current()
        setAutoLeft(n => Math.max(0, n - 1))
      },
      { root, rootMargin: '200px', threshold: 0 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [continuous, loadingMore, loading, autoLeft, hasMore, scrollRef, sentinelRef])

  const pageCount = Math.max(1, Math.ceil((total || 0) / Math.max(1, pageSize)))
  const rangeFrom = mode === 'pages' ? (total === 0 ? 0 : page * pageSize + 1) : itemCount ? 1 : 0
  const rangeTo = mode === 'pages' ? Math.min((page + 1) * pageSize, total) : itemCount
  const showLoadMore = continuous && hasMore && autoLeft <= 0 && !loadingMore

  return (
    <div className={'DataList__StatusBar'}>
      <div className={'DataList__StatusRange'}>
        {total > 0
          ? `${formatCount(rangeFrom)}–${formatCount(rangeTo)} of ${formatCount(total)}`
          : '0'}
        {showLoadMore ? (
          <button
            type={'button'}
            className={'DataList__LoadMore'}
            onClick={() => {
              paging.onLoadMore()
              setAutoLeft(AUTO_LOAD_PAGES)
            }}
          >
            Load more
          </button>
        ) : null}
        {continuous && !hasMore && itemCount > 0 ? (
          <span className={'DataList__StatusHint'}>End</span>
        ) : null}
      </div>
      {mode === 'pages' ? (
        <div className={'DataList__PageSwitch'}>
          <button
            type={'button'}
            className={'DataList__PageBtn'}
            aria-label={'Previous page'}
            disabled={page <= 0 || loading}
            onClick={() => paging.onPageChange(Math.max(0, page - 1))}
          >
            <ChevronLeft size={14} strokeWidth={2} aria-hidden />
          </button>
          <span className={'DataList__PageNum'}>
            {page + 1} / {pageCount}
          </span>
          <button
            type={'button'}
            className={'DataList__PageBtn'}
            aria-label={'Next page'}
            disabled={page + 1 >= pageCount || loading}
            onClick={() => paging.onPageChange(Math.min(pageCount - 1, page + 1))}
          >
            <ChevronRight size={14} strokeWidth={2} aria-hidden />
          </button>
        </div>
      ) : (
        <span />
      )}
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
