import TransfersListItem from './TransfersListItem'
import { EmptyListMessage } from '../ui/lists'
import { Grid, GridItem } from '@chakra-ui/react'
import './TransfersList.scss'

function TransfersList ({ transfers = [], identityId, headerStyles }) {
  const headerExtraClass = {
    default: '',
    light: 'BlocksList__ColumnTitles--Light'
  }

  return (
    <div className={'TransfersList'}>
      <Grid className={`TransfersList__ColumnTitles ${headerExtraClass[headerStyles] || ''}`}>
        <GridItem className={'TransfersList__ColumnTitle'}>
          Time
        </GridItem>
        <GridItem className={'TransfersList__ColumnTitle TransfersList__ColumnTitle--TxHash'}>
          Tx hash
        </GridItem>
        <GridItem className={'TransfersList__ColumnTitle TransfersList__ColumnTitle--Address'}>
          To
        </GridItem>
        <GridItem className={'TransfersList__ColumnTitle TransfersList__ColumnTitle--Document'}>
          Amount
        </GridItem>
        <GridItem className={'TransfersList__ColumnTitle TransfersList__ColumnTitle--Amount'}>
          Gas used
        </GridItem>
        <GridItem className={'TransfersList__ColumnTitle'}>
          Type
        </GridItem>
      </Grid>

      <div className={'TransfersList'}>
        {transfers.map((transfer, key) =>
          <TransfersListItem
            key={key}
            transfer={transfer}
            identityId={identityId}
          />
        )}

        {transfers.length === 0 &&
          <EmptyListMessage>There are no transfers yet.</EmptyListMessage>
        }
      </div>
    </div>
  )
}

export default TransfersList
