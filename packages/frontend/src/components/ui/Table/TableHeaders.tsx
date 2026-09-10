import { useEffect, useState } from 'react'
import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { Th, Box } from '@chakra-ui/react'

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
        <Th
          className={`Table__Header ${header?.sortable ? 'Table__Header--Sortable' : ''}`}
          onClick={() => header?.sortable && sortHandler(header)}
          isNumeric={header?.isNumeric}
          key={i}
        >
          {header?.sortable && (
            <div className={'TableHeader__SortDirection'}>
              {header.key === sort.key ? (
                sort.direction === 'asc' ? (
                  <ChevronDownIcon w={4} h={4} my={-1} mr={1} />
                ) : (
                  <ChevronUpIcon w={4} h={4} my={-1} mr={1} />
                )
              ) : (
                <Box w={4} height={1} mr={1} display={'inline-block'} />
              )}
            </div>
          )}
          <span>{header.label}</span>
        </Th>
      ))}
    </>
  )
}

export { TableHeaders }
