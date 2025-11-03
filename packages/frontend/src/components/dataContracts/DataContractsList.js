import DataContractsListItem from './DataContractsListItem'
import { EmptyListMessage } from '../ui/lists'
import Pagination from '../pagination'
import { ErrorMessageBlock } from '../Errors'
import { LoadingList } from '../loading'
import { Grid, GridItem } from '@chakra-ui/react'
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
  columnHelper.accessor('documentsCount', {
    header: 'Documents'
  }),
  columnHelper.accessor('timestamp', {
    header: 'Timestamp'
  })
]

function DataContractsList ({ dataContracts = [], headerStyles, pagination, loading, itemsCount = 10 }) {
  const table = useReactTable({
    data: dataContracts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true
  })

  const headerExtraClass = {
    default: '',
    light: 'DataContractsList__ColumnTitles--Light'
  }

  return (
    <div className={'DataContractsList'}>
      <Grid className={`DataContractsList__ColumnTitles ${headerExtraClass?.[headerStyles] || ''}`}>
        <GridItem className={'DataContractsList__ColumnTitle DataContractsList__ColumnTitle--Identifier'}>
          Identifier
        </GridItem>
        <GridItem className={'DataContractsList__ColumnTitle DataContractsList__ColumnTitle--DocumentsCount'}>
          Documents
        </GridItem>
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
