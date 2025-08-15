'use client'

import TokensListItem from './TokensListItem'
import { EmptyListMessage } from '../ui/lists'
import { Grid, GridItem } from '@chakra-ui/react'
import Pagination from '../pagination'
import { ErrorMessageBlock } from '../Errors'
import { LoadingList } from '../loading'
import './TokensList.scss'

function TokensList ({ tokens, rate, headerStyles = 'default', variant = 'default', pagination, loading, itemsCount = 10 }) {
  const headerExtraClass = {
    default: '',
    light: 'TokensList__ColumnTitles--Light'
  }

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

      {!loading
        ? <div className={'TokensList__Items'}>
          {tokens?.map((token, key) =>
            <TokensListItem token={token} rate={rate} variant={variant} key={key}/>
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
    </div>
  )
}

export default TokensList
