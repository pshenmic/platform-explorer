'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import useResizeObserver from '@react-hook/resize-observer'
import { EmptyListMessage } from '../index'
import './DataList.scss'

const GAP = 16
const SKELETON_ROWS = 8

// pick the columns that fit the measured width: drop the lowest-priority ones first (columns without a
// numeric priority are essential and never dropped). Returns columns in their original order.
function visibleColumns (columns, width) {
  if (!width) return columns // pre-measure (SSR / first paint): show everything
  const fits = (cols) => cols.reduce((sum, c) => sum + (c.minWidth || 0), 0) + GAP * Math.max(0, cols.length - 1) <= width
  const kept = [...columns]
  const droppable = () => kept
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => typeof c.priority === 'number')
    .sort((a, b) => a.c.priority - b.c.priority)
  while (!fits(kept) && droppable().length) {
    kept.splice(droppable()[0].i, 1)
  }
  return kept
}

// one grid template string shared by the header and every row, so columns line up by construction
function templateFor (cols) {
  return cols.map(c => (c.grow ? `minmax(0, ${Number(c.grow) || 1}fr)` : `minmax(0, ${c.minWidth}px)`)).join(' ')
}

export default function DataList ({
  items = [],
  columns = [],
  rowHref,
  rowKey,
  loading = false,
  emptyMessage = 'No data',
  headerVariant = 'default',
  footer,
  className = ''
}) {
  const wrapRef = useRef(null)
  const [width, setWidth] = useState(0)
  useResizeObserver(wrapRef, entry => setWidth(entry.contentRect.width))

  const cols = visibleColumns(columns, width)
  const template = templateFor(cols)

  return (
    <div ref={wrapRef} className={`DataList ${className}`.trim()}>
      <div className={`DataList__Head DataList__Head--${headerVariant}`} style={{ gridTemplateColumns: template }}>
        {cols.map(c => (
          <div key={c.key} className={`DataList__HeadCell DataList__HeadCell--${c.align || 'left'}`}>{c.header}</div>
        ))}
      </div>

      <div className={'DataList__Body'}>
        {loading
          ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
              <div key={i} className={'DataList__Row DataList__Row--Skeleton'} style={{ gridTemplateColumns: template }}>
                {cols.map(c => <div key={c.key} className={'DataList__Cell'}><span className={'DataList__Skeleton'}/></div>)}
              </div>
          ))
          : items.length === 0
            ? <EmptyListMessage>{emptyMessage}</EmptyListMessage>
            : items.map((item, i) => {
              const key = rowKey ? rowKey(item) : i
              const cells = cols.map(c => (
                  <div key={c.key} className={`DataList__Cell DataList__Cell--${c.align || 'left'}`}>{c.cell(item)}</div>
              ))
              const inner = <div className={'DataList__Row'} style={{ gridTemplateColumns: template }}>{cells}</div>
              return rowHref
                ? <Link key={key} href={rowHref(item)} className={'DataList__RowLink'}>{inner}</Link>
                : <div key={key} className={'DataList__RowStatic'}>{inner}</div>
            })}
      </div>

      {footer && <div className={'DataList__Footer'}>{footer}</div>}
    </div>
  )
}
