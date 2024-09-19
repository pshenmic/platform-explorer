'use client'

import { useEffect, useState } from 'react'
import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { Box } from '@chakra-ui/react'
import './ListColumnsHeader.scss'

export default function ListColumnsHeader ({ columns, sortCallback, className, columnClassName }) {
  if (!sortCallback) sortCallback = () => {}

  const [sort, setSort] = useState({ key: '', direction: 'asc' })

  function sortHandler (header) {
    setSort({
      key: header.key,
      direction: header.key === sort.key
        ? sort.direction === 'asc'
          ? 'desc'
          : 'asc'
        : 'desc'
    })
  }

  useEffect(() => sortCallback(sort), [sort, sortCallback])

  return (
    <div className={`ListColumnsHeader ${className || ''}`}>
      {columns?.length > 0 &&
        columns.map((column, key) => {
          if (typeof column === 'object') {
            return (
              <div
                key={key}
                className={`ListColumnsHeader__Column ${columnClassName || ''}`}
                onClick={() => column?.sortable && sortHandler(column)}
              >
                {column?.sortable &&
                  <div className={'ListColumnsHeader__SortDirection'}>
                    {column.key === sort.key
                      ? sort.direction === 'asc'
                        ? <ChevronDownIcon w={4} h={4} my={-1} mr={1}/>
                        : <ChevronUpIcon w={4} h={4} my={-1} mr={1}/>
                      : <Box w={4} height={1} mr={1} display={'inline-block'}/>
                    }
                  </div>
                }
                <span>{column.label}</span>
              </div>
            )
          }

          return <div key={key} className={'SimpleList__ColumnTitle'}>{column}</div>
        })
      }
    </div>
  )
}
