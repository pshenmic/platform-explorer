import DocumentsListItem from './DocumentsListItem'
import { EmptyListMessage } from '../ui/lists'
import Pagination from '../pagination'
import { LoadingList } from '../loading'
import { ErrorMessageBlock } from '../Errors'
import { Grid, GridItem } from '@chakra-ui/react'
import './DocumentsList.scss'

export default function DocumentsList ({
  documents = [],
  headerStyles,
  pagination,
  loading,
  itemsCount = 10
}) {
  const headerExtraClass = {
    default: '',
    light: 'DocumentsList__ColumnTitles--Light'
  }

  return (
    <div className={'DocumentsList'}>
      <Grid className={`DocumentsList__ColumnTitles ${headerExtraClass?.[headerStyles] || ''}`}>
        <GridItem className={'DocumentsList__ColumnTitle DocumentsList__ColumnTitle--Timestamp'}>
          Time
        </GridItem>
        <GridItem className={'DocumentsList__ColumnTitle DocumentsList__ColumnTitle--Identifier'}>
          Identifier
        </GridItem>
        <GridItem className={'DocumentsList__ColumnTitle DocumentsList__ColumnTitle--Owner'}>
          Owner
        </GridItem>
      </Grid>

      {!loading
        ? <div className={'DocumentsList__Items'}>
          {documents?.map((document, key) =>
            <DocumentsListItem document={document} key={key}/>
          )}
          {documents?.length === 0 &&
            <EmptyListMessage>There are no documents created yet.</EmptyListMessage>
          }
          {documents === undefined && <ErrorMessageBlock/>}
        </div>
        : <LoadingList itemsCount={itemsCount}/>
      }

      {pagination &&
        <Pagination
          className={'DocumentsList__Pagination'}
          onPageChange={pagination.onPageChange}
          pageCount={pagination.pageCount}
          forcePage={pagination.forcePage}
          justify={true}
        />
      }
    </div>
  )
}
