import { EmptyListMessage } from '../ui/lists'
import Pagination from '../pagination'
import { ErrorMessageBlock } from '../Errors'
import { LoadingList } from '../loading'
import { Grid, GridItem } from '@chakra-ui/react'
import './ContestedResourcesList.scss'
import { ContestedResourcesListItem } from './ContestedResourcesListItem'

export function ContestedResourcesList ({ contestedResources = [], headerStyles, pagination, loading, itemsCount = 10 }) {
  const headerExtraClass = {
    default: '',
    light: 'ContestedResourcesList__ColumnTitles--Light'
  }

  console.log('contestedResources', contestedResources)

  return (
    <div className={'ContestedResourcesList'}>
      <Grid className={`ContestedResourcesList__ColumnTitles ${headerExtraClass?.[headerStyles] || ''}`}>
        <GridItem className={'ContestedResourcesList__ColumnTitle'}>
          Time
        </GridItem>
        <GridItem className={'ContestedResourcesList__ColumnTitle'}>
          Resource Value
        </GridItem>
        <GridItem className={'ContestedResourcesList__ColumnTitle'}>
          Data Contract
        </GridItem>
        <GridItem className={'ContestedResourcesList__ColumnTitle'}>
          Index name
        </GridItem>
        <GridItem className={'ContestedResourcesList__ColumnTitle'}>
          Document type
        </GridItem>
        <GridItem className={'ContestedResourcesList__ColumnTitle'}>
          Votes
        </GridItem>
        <GridItem className={'ContestedResourcesList__ColumnTitle'}>
          Ends in
        </GridItem>
      </Grid>

      {!loading
        ? <div className={'ContestedResourcesList__Items'}>
          {contestedResources?.map((contestedResource, i) =>
            <ContestedResourcesListItem contestedResource={contestedResource} key={i}/>
          )}
          {contestedResources?.length === 0 &&
            <EmptyListMessage>There are no data contracts created yet.</EmptyListMessage>
          }
          {contestedResources === undefined && <ErrorMessageBlock/>}
        </div>
        : <LoadingList itemsCount={itemsCount}/>
      }

      {pagination &&
        <Pagination
          className={'ContestedResourcesList__Pagination'}
          onPageChange={pagination.onPageChange}
          pageCount={pagination.pageCount}
          forcePage={pagination.forcePage}
          justify={true}
        />
      }
    </div>
  )
}
