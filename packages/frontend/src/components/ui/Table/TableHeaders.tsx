import { useEffect, useState } from 'react'
import { ChevronIcon } from '../icons'
import './TableHeaders.css'

interface TableHeader {
  key: string
  label: string
  sortable?: boolean
  isNumeric?: boolean
}

interface SortState {
  key: string
  direction: 'asc' | 'desc'
}

interface TableHeadersProps {
  headers: TableHeader[]
  sortCallback?: (sort: SortState) => void
}

function TableHeaders({ headers, sortCallback }: TableHeadersProps) {
  if (!sortCallback) sortCallback = () => {}

  const [sort, setSort] = useState<SortState>({ key: 'blocksProposed', direction: 'asc' })

  function sortHandler(header: TableHeader) {
    setSort({
      key: header.key,
      direction: header.key === sort.key ? (sort.direction === 'asc' ? 'desc' : 'asc') : 'desc'
    })
  }

  useEffect(() => sortCallback(sort), [sort, sortCallback])

  return (
    <>
      {headers.map((header, i) => (
        <th
          className={`Table__Header ${header?.sortable ? 'Table__Header--Sortable' : ''} ${
            header?.isNumeric ? 'Table__Header--Numeric' : ''
          }`}
          onClick={() => header?.sortable && sortHandler(header)}
          key={i}
        >
          {header?.sortable && (
            <div className={'TableHeader__SortDirection'}>
              {header.key === sort.key ? (
                <ChevronIcon
                  className={`TableHeaders__SortIcon TableHeaders__SortIcon--${sort.direction}`}
                />
              ) : (
                <div className={'TableHeaders__SortSpacer'} />
              )}
            </div>
          )}
          <span>{header.label}</span>
        </th>
      ))}
    </>
  )
}

export { TableHeaders }
