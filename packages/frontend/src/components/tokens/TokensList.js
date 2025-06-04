'use client'

import TokensListItem from './TokensListItem'
import { EmptyListMessage } from '../ui/lists'
import { Grid, GridItem } from '@chakra-ui/react'
import Pagination from '../pagination'
import { ErrorMessageBlock } from '../Errors'
import { LoadingList } from '../loading'
import './TokensList.scss'

function TokensList ({ tokens, headerStyles = 'default', pagination, loading, itemsCount = 10 }) {
  const headerExtraClass = {
    default: '',
    light: 'TokensList__ColumnTitles--Light'
  }

  return (
    <div className={'TokensList'}>
      <Grid className={`TokensList__ColumnTitles ${headerExtraClass[headerStyles] || ''}`}>
        <GridItem className={'TokensList__ColumnTitle TokensList__ColumnTitle--TokenName'}>
          Token Name
        </GridItem>
        <GridItem className={'TokensList__ColumnTitle TokensList__ColumnTitle--Ticker'}>
          TICKER
        </GridItem>
        <GridItem className={'TokensList__ColumnTitle TokensList__ColumnTitle--Supply'}>
          Supply
        </GridItem>
        <GridItem className={'TokensList__ColumnTitle TokensList__ColumnTitle--Contract'}>
          Contract
        </GridItem>
        <GridItem className={'TokensList__ColumnTitle TokensList__ColumnTitle--OwnerIdentity'}>
          Owner Identity
        </GridItem>
      </Grid>

      {!loading
        ? <div className={'TokensList__Items'}>
          {tokens?.map((token, key) =>
            <TokensListItem token={token} key={key}/>
          )}
          {!tokens?.length &&
            <EmptyListMessage>There are no tokens yet.</EmptyListMessage>
          }
          {tokens === undefined && <ErrorMessageBlock/>}
        </div>
        : <LoadingList itemsCount={itemsCount}/>
      }

      {pagination &&
        <Pagination
          className={'TokensList__Pagination'}
          onPageChange={pagination.onPageChange}
          pageCount={pagination.pageCount}
          forcePage={pagination.forcePage}
          justify={true}
        />
      }

      {tokens?.length === 0 &&
        <EmptyListMessage>There are no tokens created yet.</EmptyListMessage>
      }
    </div>
  )
}

export default TokensList
