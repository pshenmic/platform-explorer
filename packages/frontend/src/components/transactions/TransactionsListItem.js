'use client'

import Link from 'next/link'
import { getTimeDelta } from '../../util/index'
import { Grid, GridItem } from '@chakra-ui/react'
import TypeBadge from './TypeBadge'
import './TransactionsListItem.scss'

function TransactionsListItem ({ transaction }) {
  return (
    <Link
      href={`/transaction/${transaction?.hash}`}
      className={'TransactionsListItem'}
    >
      <Grid className={`TransactionsListItem__Content ${!transaction?.timestamp && !transaction?.type ? 'TransactionsListItem__Content--Inline' : ''}`}>
        {transaction?.timestamp &&
          <GridItem className={'TransactionsListItem__Column TransactionsListItem__Column--Timestamp'}>
            {getTimeDelta(new Date(), new Date(transaction.timestamp))}
          </GridItem>
        }
        {transaction?.hash &&
          <GridItem className={'TransactionsListItem__Column TransactionsListItem__Column--Identifier'}>
            <span>{transaction.hash}</span>
          </GridItem>
        }
        {transaction?.type !== undefined &&
          <GridItem className={'TransactionsListItem__Column TransactionsListItem__Column--Type'}>
            <TypeBadge type={transaction.type}/>
          </GridItem>
        }
      </Grid>
    </Link>
  )
}

export default TransactionsListItem
