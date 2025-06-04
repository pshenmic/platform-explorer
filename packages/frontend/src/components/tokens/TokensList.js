'use client'

import TokensListItem from './TokensListItem'
import { EmptyListMessage } from '../ui/lists'
import { Grid, GridItem } from '@chakra-ui/react'
import Pagination from '../pagination'
import { ErrorMessageBlock } from '../Errors'
import { LoadingList } from '../loading'
import './TokensList.scss'

function TokensList ({ identities, headerStyles = 'default', pagination, loading, itemsCount = 10 }) {
  const headerExtraClass = {
    default: '',
    light: 'TokensList__ColumnTitles--Light'
  }

  return (
    <div className={'TokensList'}>
      <Grid className={`TokensList__ColumnTitles ${headerExtraClass[headerStyles] || ''}`}>
        <GridItem className={'TokensList__ColumnTitle TokensList__ColumnTitle--Identifier'}>
          Identifier
        </GridItem>
        <GridItem className={'TokensList__ColumnTitle TokensList__ColumnTitle--Timestamp'}>
          Timestamp
        </GridItem>
      </Grid>

      {!loading
        ? <div className={'TokensList__Items'}>
          {identities?.map((identity, key) =>
            <TokensListItem
              key={key}
              identity={identity}
            />
          )}
          {!identities?.length &&
            <EmptyListMessage>There are no identities yet.</EmptyListMessage>
          }
          {identities === undefined && <ErrorMessageBlock/>}
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

      {identities.length === 0 &&
        <EmptyListMessage>There are no identities created yet.</EmptyListMessage>
      }
    </div>
  )
}

export default TokensList
