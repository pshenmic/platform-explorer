import WithdrawalsListItem from './WithdrawalsListItem'
import { EmptyListMessage } from '../../ui/lists'
import { Grid, GridItem } from '@chakra-ui/react'
import './WithdrawalsList.scss'

function WithdrawalsList ({ withdrawals = [], headerStyles = 'default' }) {
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
        <GridItem className={'WithdrawalsList__ColumnTitle WithdrawalsList__ColumnTitle--Hash'}>
          Tx hash
        </GridItem>
        <GridItem className={'WithdrawalsList__ColumnTitle'}>
          Address
        </GridItem>
        <GridItem className={'WithdrawalsList__ColumnTitle'}>
          Document
        </GridItem>
        <GridItem className={'WithdrawalsList__ColumnTitle'}>
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
        />
      )}

      {withdrawals.length === 0 &&
        <EmptyListMessage>There are no transfers yet.</EmptyListMessage>
      }
    </div>
  )
}

export default WithdrawalsList
