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
    light: 'IdentitiesList__ColumnTitles--Light'
  }

  return (
    <div className={'IdentitiesList'}>
      <Grid className={`IdentitiesList__ColumnTitles ${headerExtraClass[headerStyles] || ''}`}>
        <GridItem className={'IdentitiesList__ColumnTitle IdentitiesList__ColumnTitle--Identifier'}>
          Identifier
        </GridItem>
        <GridItem className={'IdentitiesList__ColumnTitle IdentitiesList__ColumnTitle--Timestamp'}>
          Timestamp
        </GridItem>
      </Grid>

      {!loading
        ? <div className={'IdentitiesList__Items'}>
            {identities?.map((identity, key) =>
              <IdentitiesListItem
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
          className={'IdentitiesList__Pagination'}
          onPageChange={pagination.onPageChange}
          pageCount={pagination.pageCount}
          forcePage={pagination.forcePage}
          justify={true}
        />
      }
    </div>
  )
}

export default IdentitiesList
