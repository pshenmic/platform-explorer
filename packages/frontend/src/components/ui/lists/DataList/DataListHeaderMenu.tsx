'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { DateRangeFilter } from '../../../filters/DateRangeFilter'
import type { DateRangeFilterValue, RangeFilterValue } from '../../../filters/types'
import './DataListHeaderMenu.css'

export type DataListHeaderFilterType = 'search' | 'range' | 'daterange' | 'options'

export interface DataListHeaderMenuOption {
  value: string
  label: string
}

export interface DataListHeaderMenuProps {
  anchor: DOMRect
  filterType: DataListHeaderFilterType
  value?: unknown
  options?: DataListHeaderMenuOption[]
  placeholder?: string
  onChange: (value: unknown) => void
  onClose: () => void
}

const PANEL_WIDTH = 224

export default function DataListHeaderMenu({
  anchor,
  filterType,
  value,
  options,
  placeholder = 'Search…',
  onChange,
  onClose
}: DataListHeaderMenuProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const searchRef = useRef<HTMLInputElement | null>(null)
  const [top, setTop] = useState(anchor.bottom + 4)
  const [query, setQuery] = useState('')

  const left = Math.max(8, Math.min(anchor.right - PANEL_WIDTH, window.innerWidth - PANEL_WIDTH - 8))

  useLayoutEffect(() => {
    setQuery('')
    setTop(anchor.bottom + 4)
    const id = requestAnimationFrame(() => {
      searchRef.current?.focus()
      const rect = rootRef.current?.getBoundingClientRect()
      if (rect && rect.bottom > window.innerHeight - 8) {
        setTop(Math.max(8, anchor.top - rect.height - 4))
      }
    })
    return () => cancelAnimationFrame(id)
  }, [anchor])

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      const path = event.composedPath()
      if (path.some(el => el instanceof Element && el.classList.contains('DataList__HeadMenuBtn'))) {
        return
      }
      if (rootRef.current && !path.includes(rootRef.current)) onClose()
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    const onScroll = (event: Event) => {
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
  }, [onClose])

  const rangeValue = (value as RangeFilterValue | undefined) ?? { min: '', max: '' }
  const selected = Array.isArray(value) ? (value as string[]) : []
  const filteredOptions = (options ?? []).filter(option => {
    const q = query.trim().toLowerCase()
    return !q || option.label.toLowerCase().includes(q)
  })

  const toggleOption = (next: string) => {
    if (next === '') {
      onChange([])
      return
    }
    onChange(selected.includes(next) ? selected.filter(item => item !== next) : [...selected, next])
  }

  return createPortal(
    <div
      ref={rootRef}
      className={'DataListHeaderMenu'}
      style={{ top, left, width: PANEL_WIDTH }}
      onMouseDown={event => event.stopPropagation()}
    >
      {filterType === 'search' && (
        <div className={'DataListHeaderMenu__Search'}>
          <input
            ref={searchRef}
            type={'search'}
            value={typeof value === 'string' ? value : ''}
            placeholder={placeholder}
            onChange={event => onChange(event.target.value)}
          />
        </div>
      )}

      {filterType === 'range' && (
        <div className={'DataListHeaderMenu__Range'}>
          <input
            ref={searchRef}
            type={'number'}
            placeholder={'Min'}
            value={rangeValue.min ?? ''}
            onChange={event => onChange({ ...rangeValue, min: event.target.value })}
          />
          <input
            type={'number'}
            placeholder={'Max'}
            value={rangeValue.max ?? ''}
            onChange={event => onChange({ ...rangeValue, max: event.target.value })}
          />
        </div>
      )}

      {filterType === 'daterange' && (
        <div className={'DataListHeaderMenu__Dates'}>
          <DateRangeFilter
            value={(value as DateRangeFilterValue | undefined) ?? { start: null, end: null }}
            onChange={onChange}
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
              <span className={'DataListHeaderMenu__Check'}>{selected.length === 0 ? '✓' : ''}</span>
              All
            </button>
            {filteredOptions.map(option => (
              <button
                type={'button'}
                key={option.value}
                className={'DataListHeaderMenu__Item'}
                title={option.label}
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
