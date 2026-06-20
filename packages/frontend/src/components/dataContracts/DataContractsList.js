import DataContractsListItem from './DataContractsListItem'
import { EmptyListMessage } from '../ui/lists'
import Pagination from '../pagination'
import { ErrorMessageBlock } from '../Errors'
import { LoadingList } from '../loading'
import { ChevronIcon } from '../ui/icons'
import SmoothSize from '../ui/containers/SmoothSize'
import { Grid, GridItem } from '@chakra-ui/react'
import { useState } from 'react'
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'

import './DataContractsList.scss'

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

function DataContractsList ({ dataContracts = [], headerStyles, pagination, loading, itemsCount = 10, pinnedGroup = null }) {
  const [groupOpen, setGroupOpen] = useState(true)
  const table = useReactTable({
    data: dataContracts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true
  })

  const pinnedItems = pinnedGroup?.items || []

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
        <GridItem className={'DataContractsList__ColumnTitle DataContractsList__ColumnTitle--DocumentsCount'}>
          Documents
        </GridItem>
        <GridItem className={'DataContractsList__ColumnTitle DataContractsList__ColumnTitle--Timestamp'}>
          Timestamp
        </GridItem>
      </Grid>

      {pinnedItems.length > 0 &&
        <div className={'DataContractsList__Group'}>
          <button
            type={'button'}
            className={'DataContractsList__GroupHeader'}
            onClick={() => setGroupOpen(open => !open)}
            aria-expanded={groupOpen}
          >
            <ChevronIcon className={`DataContractsList__GroupChevron ${groupOpen ? 'DataContractsList__GroupChevron--Open' : ''}`}/>
            <span className={'DataContractsList__GroupLabel'}>{pinnedGroup.label}</span>
            <span className={'DataContractsList__GroupCount'}>{pinnedItems.length}</span>
          </button>

          <SmoothSize>
            {groupOpen &&
              <div className={'DataContractsList__Items DataContractsList__Items--Pinned'}>
                {pinnedItems.map((dataContract, index) => (
                  <DataContractsListItem dataContract={dataContract} key={dataContract?.identifier || index}/>
                ))}
              </div>
            }
          </SmoothSize>
        </div>
      }

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
