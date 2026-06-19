import DataContractsListItem from './DataContractsListItem'
import { EmptyListMessage } from '../ui/lists'
import Pagination from '../pagination'
import { ErrorMessageBlock } from '../Errors'
import { LoadingList } from '../loading'
import { Grid, GridItem } from '@chakra-ui/react'
import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons'
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'

import './DataContractsList.scss'

function SortableHeader ({ headerKey, label, modifier, sort, onSortChange }) {
  const isActive = sort?.order_by === headerKey
  const direction = isActive ? sort.order : null
  const className = [
    'DataContractsList__ColumnTitle',
    `DataContractsList__ColumnTitle--${modifier}`,
    'DataContractsList__ColumnTitle--Sortable',
    isActive ? 'DataContractsList__ColumnTitle--Active' : ''
  ].filter(Boolean).join(' ')

  const handleClick = () => {
    if (!onSortChange) return
    const nextOrder = isActive && direction === 'desc' ? 'asc' : 'desc'
    onSortChange({ order_by: headerKey, order: nextOrder })
  }

  return (
    <GridItem as={'button'} type={'button'} className={className} onClick={handleClick}>
      {isActive
        ? direction === 'asc'
          ? <ChevronUpIcon w={4} h={4}/>
          : <ChevronDownIcon w={4} h={4}/>
        : <span aria-hidden className={'DataContractsList__SortSpacer'}/>}
      <span>{label}</span>
    </GridItem>
  )
}

const columnHelper = createColumnHelper()

const columns = [
  columnHelper.accessor('identifier', {
    header: 'Identifier'
  }),
  columnHelper.accessor('owner', {
    header: 'Owner'
  }),
  columnHelper.accessor('isSystem', {
    header: 'System'
  }),
  columnHelper.accessor('withTokens', {
    header: 'With tokens'
  }),
  columnHelper.accessor('documentsCount', {
    header: 'Documents'
  }),
  columnHelper.accessor('timestamp', {
    header: 'Timestamp'
  })
]
const headerExtraClass = {
  default: '',
  light: 'DataContractsList__ColumnTitles--Light'
}

function DataContractsList ({ dataContracts = [], headerStyles, pagination, loading, itemsCount = 10, sort, onSortChange }) {
  const table = useReactTable({
    data: dataContracts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true
  })

  return (
    <div className={'DataContractsList'}>
      <Grid className={`DataContractsList__ColumnTitles ${headerExtraClass?.[headerStyles] || ''}`}>
        <GridItem className={'DataContractsList__ColumnTitle DataContractsList__ColumnTitle--Identifier'}>
          Identifier
        </GridItem>
        <GridItem className={'DataContractsList__ColumnTitle DataContractsList__ColumnTitle--Owner'}>
          Owner
        </GridItem>
        <GridItem className={'DataContractsList__ColumnTitle DataContractsList__ColumnTitle--System'}>
          System
        </GridItem>
        <GridItem className={'DataContractsList__ColumnTitle DataContractsList__ColumnTitle--WithTokens'}>
          With tokens
        </GridItem>
        <SortableHeader
          headerKey={'documents_count'}
          label={'Documents'}
          modifier={'DocumentsCount'}
          sort={sort}
          onSortChange={onSortChange}
        />
        <GridItem className={'DataContractsList__ColumnTitle DataContractsList__ColumnTitle--Timestamp'}>
          Timestamp
        </GridItem>
      </Grid>

      {!loading
        ? <div className={'DataContractsList__Items'}>
            {table.getRowModel().rows.map((row) => (
              <DataContractsListItem dataContract={row.original} key={row.id}/>
            ))}
            {dataContracts?.length === 0 &&
              <EmptyListMessage>There are no data contracts created yet.</EmptyListMessage>
            }
            {dataContracts === undefined && <ErrorMessageBlock/>}
          </div>
        : <LoadingList itemsCount={itemsCount}/>
      }

      {pagination &&
        <Pagination
          className={'DataContractsList__Pagination'}
          onPageChange={pagination.onPageChange}
          pageCount={pagination.pageCount}
          forcePage={pagination.forcePage}
          justify={true}
        />
      }
    </div>
  )
}

export default DataContractsList
