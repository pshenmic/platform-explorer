import Link from 'next/link'
import TransactionsListItem from './TransactionsListItem'
import { EmptyListMessage } from '../ui/lists'
import { Grid, GridItem } from '@chakra-ui/react'
import { LoadingList } from '../loading'
import Pagination from '../pagination'
import { ErrorMessageBlock } from '../Errors'
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'

import './TransactionsList.scss'

const columnHelper = createColumnHelper()

const columns = [
  columnHelper.accessor('timestamp', {
    header: 'Time'
  }),
  columnHelper.accessor('hash', {
    header: 'Hash'
  }),
  columnHelper.accessor('gasUsed', {
    header: 'Gas used'
  }),
  columnHelper.accessor('owner', {
    header: 'Owner'
  }),
  columnHelper.accessor('type', {
    header: 'Type'
  })
]

export default function TransactionsList ({
  transactions = [],
  showMoreLink,
  headerStyles = 'default',
  rate,
  pagination,
  loading,
  itemsCount = 10
}) {
  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      rate
    },
    manualPagination: true
  })
  const headerExtraClass = {
    default: '',
    light: 'TransactionsList__ColumnTitles--Light'
  }

  return (
    <div className={'TransactionsList'}>
      <Grid className={`TransactionsList__ColumnTitles ${headerExtraClass[headerStyles] || ''}`}>
        <GridItem className={'TransactionsList__ColumnTitle TransactionsList__ColumnTitle--Timestamp'}>
          Time
        </GridItem>
        <GridItem className={'TransactionsList__ColumnTitle TransactionsList__ColumnTitle--Hash'}>
          Hash
        </GridItem>
        <GridItem className={'TransactionsList__ColumnTitle TransactionsList__ColumnTitle--GasUsed'}>
          Gas used
        </GridItem>
        <GridItem className={'TransactionsList__ColumnTitle TransactionsList__ColumnTitle--Owner'}>
          Owner
        </GridItem>
        <GridItem className={'TransactionsList__ColumnTitle TransactionsList__ColumnTitle--Type'}>
          Type
        </GridItem>
      </Grid>

      {!loading
        ? <div className={'TransactionsList__Items'}>
            {table.getRowModel().rows.map((row) => (
              <TransactionsListItem
                key={row.id}
                transaction={row.original}
                rate={rate}
              />
            ))}
            {transactions?.length === 0 && <EmptyListMessage>There are no transactions yet.</EmptyListMessage>}
            {transactions === undefined && <ErrorMessageBlock />}
          </div>
        : <LoadingList itemsCount={itemsCount} />
      }

      {pagination &&
        <Pagination
          className={'TransactionsList__Pagination'}
          onPageChange={pagination.onPageChange}
          pageCount={pagination.pageCount}
          forcePage={pagination.forcePage}
          justify={true}
        />
      }
      {showMoreLink && <Link href={showMoreLink} className={'SimpleList__ShowMoreButton'}>Show more</Link>}
    </div>
  )
}
