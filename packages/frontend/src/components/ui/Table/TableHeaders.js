import { useEffect, useState } from 'react'
import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { Th } from '@chakra-ui/react'

function TableHeaders ({ headers, sortCallback }) {
  if (!sortCallback) sortCallback = () => {}

  const [sort, setSort] = useState({ key: 'blocksProposed', direction: 'asc' })

  function sortHandler (header) {
    console.log(header)
    console.log('direction: header.key === sort.key', header.key === sort.key)

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

  return <>
    {headers.map((header, i) => (
        <Th
          className={`Table__Header ${header?.sortable ? 'Table__Header--Sortable' : ''}`}
          onClick={() => { if (header?.sortable) sortHandler(header) }} isNumeric={header?.isNumeric}
          key={i}
        >
          {header?.sortable &&
            <span className={'Table__SortDirection'}>
              {header.key === sort.key
                ? sort.direction === 'asc'
                  ? <ChevronDownIcon w={4} h={4}/>
                  : <ChevronUpIcon w={4} h={4}/>
                : ''
              }
            </span>
          }
          <span>{header.label}</span>
        </Th>
    ))}
  </>
}

export {
  TableHeaders
}
