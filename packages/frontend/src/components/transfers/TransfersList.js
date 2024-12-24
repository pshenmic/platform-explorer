import TransfersListItem from './TransfersListItem'
import { EmptyListMessage } from '../ui/lists'
import { Grid, GridItem } from '@chakra-ui/react'
import { LoadingList } from '../loading'
import Pagination from '../pagination'
import { ErrorMessageBlock } from '../Errors'
import './TransfersList.scss'

function TransfersList ({ transfers = [], pagination, headerStyles, loading, itemsCount = 10 }) {
  const headerExtraClass = {
    default: '',
    light: 'BlocksList__ColumnTitles--Light'
  }

  return (
    <div className={'TransfersList'}>
      <div className={'TransfersList__ContentContainer'}>
        <Grid className={`TransfersList__ColumnTitles ${headerExtraClass?.[headerStyles] || ''}`}>
          <GridItem className={'TransfersList__ColumnTitle'}>
            Time
          </GridItem>
          <GridItem className={'TransfersList__ColumnTitle TransfersList__ColumnTitle--TxHash'}>
            Tx hash
          </GridItem>
          <GridItem className={'TransfersList__ColumnTitle TransfersList__ColumnTitle--Recipient'}>
            To
          </GridItem>
          <GridItem className={'TransfersList__ColumnTitle TransfersList__ColumnTitle--Amount'}>
            Amount
          </GridItem>
          <GridItem className={'TransfersList__ColumnTitle TransfersList__ColumnTitle--GasUsed'}>
            Gas used
          </GridItem>
          <GridItem className={'TransfersList__ColumnTitle TransfersList__ColumnTitle--Type'}>
            Type
          </GridItem>
        </Grid>

        {!loading
          ? <div className={'TransfersList__Items'}>
              {transfers?.map((transfer, key) =>
                <TransfersListItem
                  key={key}
                  transfer={transfer}
                />
              )}
              {transfers?.length === 0 &&
                <EmptyListMessage>There are no transfers yet.</EmptyListMessage>
              }
              {transfers === undefined && <ErrorMessageBlock/>}
            </div>
          : <LoadingList itemsCount={itemsCount}/>
        }

        {pagination &&
          <Pagination
            className={'TransfersList__Pagination'}
            onPageChange={pagination.onPageChange}
            pageCount={pagination.pageCount}
            forcePage={pagination.forcePage}
            justify={true}
          />
        }
      </div>
    </div>
  )
}

export default TransfersList
