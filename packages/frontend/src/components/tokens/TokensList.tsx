'use client'

import type { ComponentType } from 'react'
import TokensListItem from './TokensListItem'
import type { TokenListItemData } from './TokensListItem'
import { EmptyListMessage } from '../ui/lists'
import { Grid, GridItem } from '@chakra-ui/react'
import PaginationJs from '../pagination'
import { ErrorMessageBlock } from '../Errors'
import { LoadingList as LoadingListJs } from '../loading'
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import type { Rate } from '../../types'
import './TokensList.css'

const Pagination = PaginationJs as ComponentType<{
  className?: string
  onPageChange?: (selectedItem: { selected: number }) => void
  pageCount?: number
  forcePage?: number
  justify?: boolean
}>
const LoadingList = LoadingListJs as ComponentType<{ itemsCount?: number }>

const columnHelper = createColumnHelper<TokenListItemData>()

const columns = [
  columnHelper.accessor(row => row.localizations?.en?.singularForm, {
    id: 'tokenName',
    header: 'Token Name'
  }),
  columnHelper.accessor('position', { id: 'position', header: 'Position' }),
  columnHelper.accessor('totalSupply', { id: 'supply', header: 'Supply' }),
  columnHelper.accessor('price', { id: 'price', header: 'Price' }),
  columnHelper.accessor('dataContractIdentifier', { id: 'contract', header: 'Contract' }),
  columnHelper.accessor('owner', { id: 'owner', header: 'Owner' })
]

type HeaderStyles = 'default' | 'light'

const headerExtraClass: Record<HeaderStyles, string> = {
  default: '',
  light: 'TokensList__ColumnTitles--Light'
}

interface ListPagination {
  onPageChange: (selectedItem: { selected: number }) => void
  pageCount: number
  forcePage?: number
}

interface TokensListProps {
  tokens?: TokenListItemData[]
  rate?: Pick<Rate, 'usd'> | null
  headerStyles?: HeaderStyles
  variant?: 'default' | 'balance'
  pagination?: ListPagination
  loading?: boolean
  itemsCount?: number
}

function TokensList({
  tokens = [],
  rate,
  headerStyles = 'default',
  variant = 'default',
  pagination,
  loading,
  itemsCount = 10
}: TokensListProps) {
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

      {!loading ? (
        <div className={'TokensList__Items'}>
          {table.getRowModel().rows.map(row => (
            <TokensListItem key={row.id} token={row.original} rate={rate} variant={variant} />
          ))}
          {tokens?.length === 0 && <EmptyListMessage>There are no tokens yet.</EmptyListMessage>}
          {tokens === undefined && <ErrorMessageBlock />}
        </div>
      ) : (
        <LoadingList itemsCount={itemsCount} />
      )}

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
