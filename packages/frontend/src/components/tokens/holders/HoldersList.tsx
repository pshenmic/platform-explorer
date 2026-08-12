import type { ComponentType } from 'react'
import HoldersListItem from './HoldersListItem'
import type { TokenHolder } from './HoldersListItem'
import { EmptyListMessage } from '../../ui/lists'
import PaginationJs from '../../pagination'
import { LoadingList as LoadingListJs } from '../../loading'
import { ErrorMessageBlock } from '../../Errors'
import { Grid, GridItem } from '@chakra-ui/react'
import './HoldersList.css'

const Pagination = PaginationJs as ComponentType<{
  className?: string
  onPageChange?: (selectedItem: { selected: number }) => void
  pageCount?: number
  forcePage?: number
  justify?: boolean
}>
const LoadingList = LoadingListJs as ComponentType<{ itemsCount?: number }>

type HeaderStyles = 'default' | 'light'

interface ListPagination {
  onPageChange: (selectedItem: { selected: number }) => void
  pageCount: number
  forcePage?: number
}

interface HoldersListProps {
  holders?: TokenHolder[]
  headerStyles?: HeaderStyles
  pagination?: ListPagination
  loading?: boolean
  itemsCount?: number
}

export default function HoldersList({
  holders = [],
  headerStyles,
  pagination,
  loading,
  itemsCount = 10
}: HoldersListProps) {
  const headerExtraClass: Record<HeaderStyles, string> = {
    default: '',
    light: 'HoldersList__ColumnTitles--Light'
  }

  return (
    <div className={'HoldersList'}>
      <Grid
        className={`HoldersList__ColumnTitles ${headerStyles ? headerExtraClass[headerStyles] || '' : ''}`}
      >
        <GridItem className={'HoldersList__ColumnTitle HoldersList__ColumnTitle--Holder'}>
          Holder
        </GridItem>
        <GridItem className={'HoldersList__ColumnTitle HoldersList__ColumnTitle--TokensAmount'}>
          Tokens
        </GridItem>
        <GridItem className={'HoldersList__ColumnTitle HoldersList__ColumnTitle--DashAmount'}>
          Dash
        </GridItem>
        <GridItem className={'HoldersList__ColumnTitle HoldersList__ColumnTitle--LastActivity'}>
          Last Activity
        </GridItem>
      </Grid>

      {!loading ? (
        <div className={'HoldersList__Items'}>
          {holders?.map((holder, key) => (
            <HoldersListItem holder={holder} key={key} />
          ))}
          {holders?.length === 0 && <EmptyListMessage>There are no holders yet.</EmptyListMessage>}
          {holders === undefined && <ErrorMessageBlock />}
        </div>
      ) : (
        <LoadingList itemsCount={itemsCount} />
      )}

      {pagination && (
        <Pagination
          className={'HoldersList__Pagination'}
          onPageChange={pagination.onPageChange}
          pageCount={pagination.pageCount}
          forcePage={pagination.forcePage}
          justify={true}
        />
      )}
    </div>
  )
}
