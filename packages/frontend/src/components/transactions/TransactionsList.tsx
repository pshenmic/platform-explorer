import type { ComponentType, ReactNode } from 'react'
import Link from 'next/link'
import TransactionsListItem from './TransactionsListItem'
import { EmptyListMessage } from '@ui/lists'
import { Grid, GridItem } from '@chakra-ui/react'
import { LoadingList as LoadingListJs } from '../loading'
import PaginationJs from '../pagination'
import { ErrorMessageBlock } from '../Errors'
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import type { Rate, Transaction } from '../../types'

import './TransactionsList.scss'

const LoadingList = LoadingListJs as ComponentType<{ itemsCount?: number }>
const Pagination = PaginationJs as ComponentType<{
  className?: string
  onPageChange?: (selectedItem: { selected: number }) => void
  pageCount?: number
  forcePage?: number
  justify?: boolean
  children?: ReactNode
}>

const columnHelper = createColumnHelper<Transaction>()

const columns = [
  columnHelper.accessor('status', {
    header: 'Status'
  }),
  columnHelper.accessor('hash', {
    header: 'Hash'
  }),
  columnHelper.accessor('blockHeight', {
    header: 'Block'
  }),
  columnHelper.accessor('gasUsed', {
    header: 'Gas used'
  }),
  columnHelper.accessor('owner', {
    header: 'Owner'
  }),
  columnHelper.accessor('type', {
    header: 'Type'
  }),
  columnHelper.accessor('timestamp', {
    header: 'Timestamp'
  })
]

type HeaderStyles = 'default' | 'light'

const headerExtraClass: Record<HeaderStyles, string> = {
  default: '',
  light: 'TransactionsList__ColumnTitles--Light'
}

interface ListPagination {
  onPageChange: (selectedItem: { selected: number }) => void
  pageCount: number
  forcePage?: number
}

interface TransactionsListProps {
  transactions?: Transaction[]
  showMoreLink?: string
  headerStyles?: HeaderStyles
  rate?: Pick<Rate, 'usd'> | null
  pagination?: ListPagination
  loading?: boolean
  itemsCount?: number
  absoluteDate?: boolean
}

export default function TransactionsList ({
  transactions = [],
  showMoreLink,
  headerStyles = 'default',
  rate,
  pagination,
  loading,
  itemsCount = 10,
  absoluteDate = false
}: TransactionsListProps) {
  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      rate
    },
    manualPagination: true
  })

  return (
    <div className={'TransactionsList'}>
      <Grid className={`TransactionsList__ColumnTitles ${headerExtraClass[headerStyles] || ''}`}>
        <GridItem className={'TransactionsList__ColumnTitle TransactionsList__ColumnTitle--Status'}>
          Status
        </GridItem>
        <GridItem className={'TransactionsList__ColumnTitle TransactionsList__ColumnTitle--Hash'}>
          Hash
        </GridItem>
        <GridItem className={'TransactionsList__ColumnTitle TransactionsList__ColumnTitle--Block'}>
          Block
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
        <GridItem className={'TransactionsList__ColumnTitle TransactionsList__ColumnTitle--Timestamp'}>
          Timestamp
        </GridItem>
      </Grid>

      {!loading
        ? <div className={'TransactionsList__Items'}>
            {table.getRowModel().rows.map((row) => (
              <TransactionsListItem
                key={row.id}
                transaction={row.original}
                rate={rate}
                absoluteDate={absoluteDate}
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
