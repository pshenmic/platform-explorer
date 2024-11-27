import WithdrawalsListItem from './WithdrawalsListItem'
import { EmptyListMessage } from '../../ui/lists'
import { Grid, GridItem } from '@chakra-ui/react'
import './WithdrawalsList.scss'

function WithdrawalsList ({ withdrawals = [], headerStyles = 'default', defaultPayoutAddress, rate, l1explorerBaseUrl }) {
  const headerExtraClass = {
    default: '',
    light: 'BlocksList__ColumnTitles--Light'
  }

  return (
    <div className={'WithdrawalsList'}>
      <Grid className={`WithdrawalsList__ColumnTitles ${headerExtraClass[headerStyles] || ''}`}>
        <GridItem className={'WithdrawalsList__ColumnTitle'}>
          Timestamp
        </GridItem>
        <GridItem className={'WithdrawalsList__ColumnTitle WithdrawalsList__ColumnTitle--TxHash'}>
          Tx hash
        </GridItem>
        <GridItem className={'WithdrawalsList__ColumnTitle WithdrawalsList__ColumnTitle--Address'}>
          Address
        </GridItem>
        <GridItem className={'WithdrawalsList__ColumnTitle WithdrawalsList__ColumnTitle--Document'}>
          Document
        </GridItem>
        <GridItem className={'WithdrawalsList__ColumnTitle WithdrawalsList__ColumnTitle--Amount'}>
          Amount
        </GridItem>
        <GridItem className={'WithdrawalsList__ColumnTitle'}>
          Status
        </GridItem>
      </Grid>

      {withdrawals.map((withdrawal, key) =>
        <WithdrawalsListItem
          key={key}
          withdrawal={withdrawal}
          l1explorerBaseUrl={l1explorerBaseUrl}
          rate={rate}
          defaultPayoutAddress={defaultPayoutAddress}
        />
      )}

      {withdrawals.length === 0 &&
        <EmptyListMessage>There are no withdrawals yet.</EmptyListMessage>
      }
    </div>
  )
}

export default WithdrawalsList
