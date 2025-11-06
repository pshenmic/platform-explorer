'use client'

import TokensListItem from './TokensListItem'
import { EmptyListMessage } from '../ui/lists'
import { Grid, GridItem } from '@chakra-ui/react'
import Pagination from '../pagination'
import { ErrorMessageBlock } from '../Errors'
import { LoadingList } from '../loading'
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import './TokensList.scss'

const columnHelper = createColumnHelper()

const columns = [
  columnHelper.accessor('name', { id: 'tokenName', header: 'Token Name' }),
  columnHelper.accessor('position', { id: 'position', header: 'Position' }),
  columnHelper.accessor('totalSupply', { id: 'supply', header: 'Supply' }),
  columnHelper.accessor('price', { id: 'price', header: 'Price' }),
  columnHelper.accessor('dataContractIdentifier', { id: 'contract', header: 'Contract' }),
  columnHelper.accessor('owner', { id: 'owner', header: 'Owner' })
]

const headerExtraClass = {
  default: '',
  light: 'TokensList__ColumnTitles--Light'
}

function TokensList ({
  tokens = [],
  rate,
  headerStyles = 'default',
  variant = 'default',
  pagination,
  loading,
  itemsCount = 10
}) {
  const table = useReactTable({
    data: tokens || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true
  })

  const variantClass = variant === 'balance' ? 'TokensList--Balance' : ''

  return (
    <div className={`TokensList ${variantClass}`}>
      <Grid className={`TokensList__ColumnTitles ${headerExtraClass[headerStyles] || ''}`}>
        <GridItem className={'TokensList__ColumnTitle TokensList__ColumnTitle--TokenName'}>
          Token Name
        </GridItem>
        <GridItem className={'TokensList__ColumnTitle TokensList__ColumnTitle--Position'}>
          Position
        </GridItem>
        <GridItem className={'TokensList__ColumnTitle TokensList__ColumnTitle--Supply'}>
          Supply
        </GridItem>
        <GridItem className={'TokensList__ColumnTitle TokensList__ColumnTitle--Price'}>
          Price
        </GridItem>
        <GridItem className={'TokensList__ColumnTitle TokensList__ColumnTitle--DataContract'}>
          Contract
        </GridItem>
        <GridItem className={'TokensList__ColumnTitle TokensList__ColumnTitle--OwnerIdentity'}>
          Owner
        </GridItem>
        {variant === 'balance' && (
          <GridItem className={'TokensList__ColumnTitle TokensList__ColumnTitle--Balance'}>
            Balance
          </GridItem>
        )}
      </Grid>

      {!loading
        ? <div className={'TokensList__Items'}>
            {table.getRowModel().rows.map((row) => (
              <TokensListItem
                key={row.id}
                token={row.original}
                rate={rate}
                variant={variant}
              />
            ))}
            {tokens?.length === 0 && (
              <EmptyListMessage>There are no tokens yet.</EmptyListMessage>
            )}
            {tokens === undefined && <ErrorMessageBlock />}
          </div>
        : <LoadingList itemsCount={itemsCount} />
      }

      {pagination && (
        <Pagination
          className={'TokensList__Pagination'}
          onPageChange={pagination.onPageChange}
          pageCount={pagination.pageCount}
          forcePage={pagination.forcePage}
          justify={true}
        />
      )}
    </div>
  )
}

export default TokensList
