import { EmptyListMessage } from '../ui/lists'
import Pagination from '../pagination'
import { ErrorMessageBlock } from '../Errors'
import { LoadingList } from '../loading'
import { Grid, GridItem } from '@chakra-ui/react'
import './ContestedResourcesList.scss'

export function ContestedResourcesList ({ contestedResources = [], headerStyles, pagination, loading, itemsCount = 10 }) {
  const headerExtraClass = {
    default: '',
    light: 'ContestedResourcesList__ColumnTitles--Light'
  }

  return (
    <div className={'ContestedResourcesList'}>
      <Grid className={`ContestedResourcesList__ColumnTitles ${headerExtraClass?.[headerStyles] || ''}`}>
        <GridItem className={'ContestedResourcesList__ColumnTitle'}>
          Time
        </GridItem>
        <GridItem className={'ContestedResourcesList__ColumnTitle'}>
          RESOURCE VALUE
        </GridItem>
        <GridItem className={'ContestedResourcesList__ColumnTitle'}>
          DATA CONTRACT
        </GridItem>

        <GridItem className={'ContestedResourcesList__ColumnTitle'}>
          INDEX NAME
        </GridItem>

        <GridItem className={'ContestedResourcesList__ColumnTitle'}>
          INDEX NAME
        </GridItem>

        <GridItem className={'ContestedResourcesList__ColumnTitle'}>
          INDEX NAME
        </GridItem>

        <GridItem className={'ContestedResourcesList__ColumnTitle'}>
          Ends in
        </GridItem>

      </Grid>

      {!loading
        ? <div className={'ContestedResourcesList__Items'}>
          {contestedResources?.map((contestedResource, i) =>
            <div key={i}>contested resource item</div>
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
