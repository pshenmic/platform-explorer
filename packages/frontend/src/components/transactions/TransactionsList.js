import Link from 'next/link'
import TransactionsListItem from './TransactionsListItem'
import { EmptyListMessage } from '../ui/lists'
import { Grid, GridItem } from '@chakra-ui/react'
import './TransactionsList.scss'

export default function TransactionsList ({ transactions = [], showMoreLink, type = 'full', headerStyles = 'default' }) {
  const headerExtraClass = {
    default: '',
    light: 'BlocksList__ColumnTitles--Light'
  }

  return (
    <div className={'TransactionsList'}>
      {type === 'full' &&
        <Grid className={`TransactionsList__ColumnTitles ${headerExtraClass[headerStyles] || ''}`}>
          <GridItem className={'TransactionsList__ColumnTitle'}>
            Time
          </GridItem>
          <GridItem className={'TransactionsList__ColumnTitle TransactionsList__ColumnTitle--Hash'}>
            Transaction Hash
          </GridItem>
          <GridItem className={'TransactionsList__ColumnTitle'}>
            Type
          </GridItem>
        </Grid>
      }

      {transactions?.length > 0
        ? transactions.map((transaction, key) => (
            <TransactionsListItem
              key={key}
              transaction={transaction}
            />
        ))
        : <EmptyListMessage>There are no transactions yet.</EmptyListMessage>
      }

      {showMoreLink &&
        <Link href={showMoreLink} className={'SimpleList__ShowMoreButton'}>Show more</Link>
      }
    </div>
  )
}
