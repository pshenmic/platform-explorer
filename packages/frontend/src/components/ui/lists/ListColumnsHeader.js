'use client'

import './ListColumnsHeader.scss'

export default function ListColumnsHeader ({ headers, className, columnClassName }) {
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
