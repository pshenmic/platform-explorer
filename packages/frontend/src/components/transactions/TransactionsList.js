import Link from 'next/link'
import TransactionsListItem from './TransactionsListItem'
import { EmptyListMessage } from '../lists'
import { Grid, GridItem } from '@chakra-ui/react'
import './TransactionsList.scss'

export default function TransactionsList ({ transactions = [], showMoreLink, size = 'l', type = 'full' }) {
  return (
    <div className={'TransactionsList ' + 'TransactionsList--Size' + size.toUpperCase()}>
      {type === 'full' &&
        <Grid className={'TransactionsList__ColumnTitles'}>
          <GridItem className={'TransactionsList__ColumnTitle'}>
            Time
          </GridItem>
          <GridItem className={'TransactionsList__ColumnTitle TransactionsList__ColumnTitle--Hash'}>
            Transaction HASH
          </GridItem>
          <GridItem className={'TransactionsList__ColumnTitle'}>
            TYPE
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
        : <EmptyListMessage>There are no transactions created yet.</EmptyListMessage>
      }

      {showMoreLink &&
        <Link href={showMoreLink} className={'SimpleList__ShowMoreButton'}>Show more</Link>
      }
    </div>
  )
}
