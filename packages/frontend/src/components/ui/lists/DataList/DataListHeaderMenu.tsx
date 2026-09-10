'use client'

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { DateRangeFilter } from '../../../filters/DateRangeFilter'
import type { DateRangeFilterValue, RangeFilterValue } from '../../../filters/types'
import './DataListHeaderMenu.css'

export type DataListHeaderFilterType = 'search' | 'range' | 'daterange' | 'options'

export interface DataListHeaderMenuOption {
  value: string
  label: ReactNode
  searchText?: string
}

export interface DataListHeaderMenuProps {
  anchor: DOMRect
  filterType?: DataListHeaderFilterType
  value?: unknown
  options?: DataListHeaderMenuOption[]
  placeholder?: string
  onChange?: (value: unknown) => void
  onClose: () => void
  sortKey?: string
  sortOrder?: string
  onSortChange?: (order: string) => void
}

const PANEL_WIDTH = 224

export default function DataListHeaderMenu({
  anchor,
  filterType,
  value,
  options,
  placeholder = 'Search…',
  onChange,
  onClose,
  sortKey,
  sortOrder,
  onSortChange
}: DataListHeaderMenuProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const searchRef = useRef<HTMLInputElement | null>(null)
  const [top, setTop] = useState(anchor.bottom + 4)
  const [left, setLeft] = useState(8)
  const [query, setQuery] = useState('')
  const panelWidth =
    filterType === 'daterange'
      ? Math.min(window.innerWidth < 768 ? 320 : 352, window.innerWidth - 16)
      : PANEL_WIDTH

  useLayoutEffect(() => {
    setQuery('')
    const margin = 8
    const maxWidth = Math.max(0, window.innerWidth - margin * 2)
    const maxLeft = Math.max(margin, window.innerWidth - Math.min(panelWidth, maxWidth) - margin)
    setLeft(Math.max(margin, Math.min(anchor.right - panelWidth, maxLeft)))
    setTop(anchor.bottom + 4)
    const id = requestAnimationFrame(() => {
      const el = rootRef.current
      if (filterType === 'search' || filterType === 'options') {
        searchRef.current?.focus()
      } else {
        el?.focus()
      }
      if (!el) return
      const width = Math.min(el.offsetWidth, maxWidth)
      const height = el.offsetHeight
      let nextLeft = Math.min(anchor.right - width, window.innerWidth - width - margin)
      nextLeft = Math.max(margin, nextLeft)
      setLeft(nextLeft)
      let nextTop = anchor.bottom + 4
      if (nextTop + height > window.innerHeight - margin) {
        nextTop = Math.max(margin, anchor.top - height - 4)
      }
      if (nextTop + height > window.innerHeight - margin) {
        nextTop = Math.max(margin, window.innerHeight - height - margin)
      }
      setTop(nextTop)
    })
    return () => cancelAnimationFrame(id)
  }, [anchor, panelWidth, filterType])

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      const path = event.composedPath()
      if (
        path.some(el => el instanceof Element && el.classList.contains('DataList__HeadMenuBtn'))
      ) {
        return
      }
      if (rootRef.current && !path.includes(rootRef.current)) onClose()
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    const onScroll = (event: Event) => {
      if (filterType === 'daterange') return
      const target = event.target
      if (target instanceof Node && rootRef.current?.contains(target)) return
      onClose()
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onClose)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onClose)
    }
  }, [onClose, filterType])

  const rangeValue = (value as RangeFilterValue | undefined) ?? { min: '', max: '' }
  const selected = Array.isArray(value) ? (value as string[]) : []
  const optionSearchText = (option: DataListHeaderMenuOption) =>
    (option.searchText ?? (typeof option.label === 'string' ? option.label : '')).toLowerCase()

  const filteredOptions = (options ?? []).filter(option => {
    const q = query.trim().toLowerCase()
    return !q || optionSearchText(option).includes(q)
  })

  const toggleOption = (next: string) => {
    if (next === '') {
      onChange?.([])
      return
    }
    onChange?.(
      selected.includes(next) ? selected.filter(item => item !== next) : [...selected, next]
    )
  }

  return createPortal(
    <div
      ref={rootRef}
      className={`DataListHeaderMenu${filterType === 'daterange' ? ' DataListHeaderMenu--Dates' : ''}`}
      style={{ top, left, width: panelWidth }}
      tabIndex={-1}
      onMouseDown={event => event.stopPropagation()}
    >
      {sortKey && onSortChange ? (
        <div className={'DataListHeaderMenu__Sort'}>
          <div className={'DataListHeaderMenu__SortLabel'}>Sort</div>
          <div className={'DataListHeaderMenu__SortRow'}>
            <button
              type={'button'}
              className={`DataListHeaderMenu__SortBtn${sortOrder === 'desc' ? ' DataListHeaderMenu__SortBtn--Active' : ''}`}
              onClick={() => onSortChange('desc')}
            >
              High to low
            </button>
            <button
              type={'button'}
              className={`DataListHeaderMenu__SortBtn${sortOrder === 'asc' ? ' DataListHeaderMenu__SortBtn--Active' : ''}`}
              onClick={() => onSortChange('asc')}
            >
              Low to high
            </button>
          </div>
        </div>
      ) : null}
      {filterType === 'search' && (
        <div className={'DataListHeaderMenu__Search'}>
          <input
            ref={searchRef}
            type={'text'}
            value={typeof value === 'string' ? value : ''}
            placeholder={placeholder}
            onChange={event => onChange?.(event.target.value)}
          />
        </div>
      )}

      {filterType === 'range' && (
        <div className={'DataListHeaderMenu__Range'}>
          <input
            ref={searchRef}
            type={'number'}
            inputMode={'numeric'}
            placeholder={'Min'}
            value={rangeValue.min ?? ''}
            onChange={event => onChange?.({ ...rangeValue, min: event.target.value })}
          />
          <input
            type={'number'}
            inputMode={'numeric'}
            placeholder={'Max'}
            value={rangeValue.max ?? ''}
            onChange={event => onChange?.({ ...rangeValue, max: event.target.value })}
          />
        </div>
      )}

      {filterType === 'daterange' && (
        <div className={'DataListHeaderMenu__Dates'}>
          <DateRangeFilter
            compact={true}
            value={(value as DateRangeFilterValue | undefined) ?? { start: null, end: null }}
            onChange={next => onChange?.(next)}
          />
        </div>
      )}

      {filterType === 'options' && (
        <>
          <div className={'DataListHeaderMenu__Search'}>
            <input
              ref={searchRef}
              type={'text'}
              value={query}
              placeholder={'Search…'}
              onChange={event => setQuery(event.target.value)}
            />
          </div>
          <div className={'DataListHeaderMenu__List'}>
            <button
              type={'button'}
              className={'DataListHeaderMenu__Item'}
              onClick={() => toggleOption('')}
            >
              <span className={'DataListHeaderMenu__Check'}>
                {selected.length === 0 ? '✓' : ''}
              </span>
              All
            </button>
            {filteredOptions.map(option => (
              <button
                type={'button'}
                key={option.value}
                className={'DataListHeaderMenu__Item'}
                title={
                  option.searchText ?? (typeof option.label === 'string' ? option.label : undefined)
                }
                onClick={() => toggleOption(option.value)}
              >
                <span className={'DataListHeaderMenu__Check'}>
                  {selected.includes(option.value) ? '✓' : ''}
                </span>
                <span className={'DataListHeaderMenu__Label'}>{option.label}</span>
              </button>
            ))}
            {filteredOptions.length === 0 && (
              <div className={'DataListHeaderMenu__Empty'}>Nothing found</div>
            )}
          </div>
        </>
      )}
    </div>,
    document.body
  )
}
