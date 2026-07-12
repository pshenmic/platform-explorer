'use client'

import type { ReactNode } from 'react'
import './ListColumnsHeader.scss'

interface ListColumn {
  id: string | number
  column: { columnDef?: { header?: ReactNode } }
}

interface ListColumnsHeaderProps {
  headers: ListColumn[]
  className?: string
  columnClassName?: string
}

export default function ListColumnsHeader ({ headers, className, columnClassName }: ListColumnsHeaderProps) {
  return (
    <div className={`ListColumnsHeader ${className || ''}`}>
        {headers.map((col) => (
          <div
            key={col.id}
            className={`ListColumnsHeader__Column ${columnClassName || ''}`}
          >
            <span>{col.column.columnDef?.header}</span>
          </div>
        ))}
    </div>
  )
}
