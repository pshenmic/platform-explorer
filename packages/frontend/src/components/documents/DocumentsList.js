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
  itemsCount = 10,
  showDataContract = false,
  showAction = true,
  showGas = true
}) {
  const headerExtraClass = {
    default: '',
    light: 'DocumentsList__ColumnTitles--Light'
  }

  const compact = !showAction && !showGas

  return (
    <div className={'DocumentsList'}>
      <div className={`DocumentsList__Table${compact ? ' DocumentsList__Table--Compact' : ''}`}>
      <Grid className={`DocumentsList__ColumnTitles ${headerExtraClass?.[headerStyles] || ''}`}>
        <GridItem className={'DocumentsList__ColumnTitle DocumentsList__ColumnTitle--Timestamp'}>
          Time
        </GridItem>
        {showAction &&
          <GridItem className={'DocumentsList__ColumnTitle DocumentsList__ColumnTitle--TransitionType'}>
            Action
          </GridItem>
        }
        <GridItem className={'DocumentsList__ColumnTitle DocumentsList__ColumnTitle--DocumentType'}>
          Type
        </GridItem>
        <GridItem className={'DocumentsList__ColumnTitle DocumentsList__ColumnTitle--Revision'}>
          Rev
        </GridItem>
        <GridItem className={'DocumentsList__ColumnTitle DocumentsList__ColumnTitle--Identifier'}>
          Identifier
        </GridItem>
        <GridItem className={`DocumentsList__ColumnTitle DocumentsList__ColumnTitle--${showDataContract ? 'DataContract' : 'Owner'}`}>
          {showDataContract ? 'Data Contract' : 'Owner'}
        </GridItem>
        {showGas &&
          <GridItem className={'DocumentsList__ColumnTitle DocumentsList__ColumnTitle--Gas'}>
            Gas
          </GridItem>
        }
        <GridItem className={'DocumentsList__ColumnTitle DocumentsList__ColumnTitle--Status'}>
          Status
        </GridItem>
      </Grid>

      {!loading
        ? <>
          {documents?.map((document, key) =>
            <DocumentsListItem document={document} showDataContract={showDataContract} showAction={showAction} showGas={showGas} key={key}/>
          )}
          {documents?.length === 0 &&
            <EmptyListMessage>There are no documents created yet.</EmptyListMessage>
          }
          {documents === undefined && <ErrorMessageBlock/>}
        </>
        : <LoadingList itemsCount={itemsCount}/>
      }
      </div>

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
