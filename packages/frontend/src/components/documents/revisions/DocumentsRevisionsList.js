import DocumentsRevisionsListItem from './DocumentsRevisionsListItem'
import { EmptyListMessage } from '../../ui/lists'
import Pagination from '../../pagination'
import { LoadingList } from '../../loading'
import { ErrorMessageBlock } from '../../Errors'
import { Grid, GridItem } from '@chakra-ui/react'
import './DocumentsRevisionsList.scss'

export default function DocumentsRevisionsList ({
  revisions = [],
  headerStyles,
  pagination,
  loading,
  itemsCount = 10
}) {
  const headerExtraClass = {
    default: '',
    light: 'DocumentsRevisionsList__ColumnTitles--Light'
  }

  return (
    <div className={'DocumentsRevisionsList'}>
      <Grid className={`DocumentsRevisionsList__ColumnTitles ${headerExtraClass?.[headerStyles] || ''}`}>
        <GridItem className={'DocumentsRevisionsList__ColumnTitle DocumentsRevisionsList__ColumnTitle--Timestamp'}>
          Time
        </GridItem>
        <GridItem className={'DocumentsRevisionsList__ColumnTitle DocumentsRevisionsList__ColumnTitle--TxHash'}>
          Tx Hash
        </GridItem>
        <GridItem className={'DocumentsRevisionsList__ColumnTitle DocumentsRevisionsList__ColumnTitle--Owner'}>
          Owner
        </GridItem>
        <GridItem className={'DocumentsRevisionsList__ColumnTitle DocumentsRevisionsList__ColumnTitle--GasUsed'}>
          Gas Used
        </GridItem>
        <GridItem className={'DocumentsRevisionsList__ColumnTitle DocumentsRevisionsList__ColumnTitle--TransitionType'}>
          Transition
        </GridItem>
        <GridItem className={'DocumentsRevisionsList__ColumnTitle DocumentsRevisionsList__ColumnTitle--Revision'}>
          Revision
        </GridItem>
      </Grid>

      {!loading
        ? <div className={'DocumentsRevisionsList__Items'}>
          {revisions?.map((revision, key) =>
            <DocumentsRevisionsListItem revision={revision} key={key}/>
          )}
          {revisions?.length === 0 &&
            <EmptyListMessage>There are no documents created yet.</EmptyListMessage>
          }
          {revisions === undefined && <ErrorMessageBlock/>}
        </div>
        : <LoadingList itemsCount={itemsCount}/>
      }

      {pagination &&
        <Pagination
          className={'DocumentsRevisionsList__Pagination'}
          onPageChange={pagination.onPageChange}
          pageCount={pagination.pageCount}
          forcePage={pagination.forcePage}
          justify={true}
        />
      }
    </div>
  )
}
