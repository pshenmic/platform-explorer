'use client'

import IdentitiesListItem from './IdentitiesListItem'
import { EmptyListMessage } from '../ui/lists'
import { Grid, GridItem } from '@chakra-ui/react'
import Pagination from '../pagination'
import { ErrorMessageBlock } from '../Errors'
import { LoadingList } from '../loading'
import './IdentitiesList.scss'

function IdentitiesList ({ identities, headerStyles = 'default', pagination, loading, itemsCount = 10 }) {
  const headerExtraClass = {
    default: '',
    light: 'TransactionsList__ColumnTitles--Light'
  }

  return (
    <div className={'IdentitiesList'}>
      <Grid className={`TransactionsList__ColumnTitles ${headerExtraClass[headerStyles] || ''}`}>
        <GridItem className={'TransactionsList__ColumnTitle TransactionsList__ColumnTitle--Identifier'}>
          Identifier
        </GridItem>
        <GridItem className={'TransactionsList__ColumnTitle TransactionsList__ColumnTitle--Timestamp'}>
          Timestamp
        </GridItem>
      </Grid>

      {!loading
        ? <div className={'TransactionsList__Items'}>
            {identities?.map((identity, key) =>
              <IdentitiesListItem
                key={key}
                identity={identity}
              />
            )}
            {!identities?.length &&
              <EmptyListMessage>There are no transactions yet.</EmptyListMessage>
            }
            {identities === undefined && <ErrorMessageBlock/>}
          </div>
        : <LoadingList itemsCount={itemsCount}/>
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

      {identities.length === 0 &&
        <EmptyListMessage>There are no identities created yet.</EmptyListMessage>
      }
    </div>
  )
}

export default IdentitiesList
