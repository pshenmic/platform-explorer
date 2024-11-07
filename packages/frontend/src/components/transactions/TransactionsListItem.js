'use client'

import Link from 'next/link'
import { getTimeDelta } from '../../util/index'
import { Grid, GridItem } from '@chakra-ui/react'
import TypeBadge from './TypeBadge'
import { Identifier, Credits } from '../data'
import StatusIcon from './StatusIcon'
import { RateTooltip } from '../ui/Tooltips'
import './TransactionsListItem.scss'

function TransactionsListItem ({ transaction, rate }) {
  return (
    <Link
      href={`/transaction/${transaction?.hash}`}
      className={'TransactionsListItem'}
    >
      <Grid className={`TransactionsListItem__Content ${!transaction?.timestamp && !transaction?.type ? 'TransactionsListItem__Content--Inline' : ''}`}>
        {transaction?.timestamp &&
          <GridItem className={'TransactionsListItem__Column TransactionsListItem__Column--Timestamp'}>
            <StatusIcon className={'TransactionsListItem__StatusIcon'} status={transaction.status} w={'18px'} h={'18px'} mr={'8px'}/>
            {getTimeDelta(new Date(), new Date(transaction.timestamp))}
          </GridItem>
        }
        {transaction?.hash &&
          <GridItem className={'TransactionsListItem__Column TransactionsListItem__Column--Hash'}>
            <Identifier styles={['highlight-both']}>{transaction.hash}</Identifier>
          </GridItem>
        }
        {transaction?.gasUsed &&
          <GridItem className={'TransactionsListItem__Column TransactionsListItem__Column--GasUsed'}>
            <RateTooltip
              credits={transaction.gasUsed}
              rate={rate?.data}
              placement={'top'}
            >
              <span><Credits>{transaction.gasUsed}</Credits> Credits</span>
            </RateTooltip>
          </GridItem>
        }
        {(transaction?.sender || true) &&
          <GridItem className={'TransactionsListItem__Column TransactionsListItem__Column--Sender'}>
            <Identifier avatar={true} styles={['highlight-both']}>3TfBxpwdmiHsrajx7EmErGnV597uYdH3JGhvwpVDcdAT</Identifier>
          </GridItem>
        }
        {transaction?.type !== undefined &&
          <GridItem className={'TransactionsListItem__Column TransactionsListItem__Column--Type'}>
            <TypeBadge className={'TransactionsListItem__TypeBadge'} typeId={transaction.type}/>
          </GridItem>
        }
      </Grid>
    </Link>
  )
}

export default TransactionsListItem
