'use client'

import Link from 'next/link'
import { getTimeDelta } from '../../util/index'
import { Grid, GridItem } from '@chakra-ui/react'
import TypeBadge from './TypeBadge'
import { Identifier, Credits, Alias } from '../data'
import StatusIcon from './StatusIcon'
import { RateTooltip } from '../ui/Tooltips'
import './TransactionsListItem.scss'
import ImageGenerator from '../imageGenerator'

function TransactionsListItem ({ transaction, rate }) {
  const activeAlias = transaction?.owner?.aliases?.find(alias => alias.status === 'ok')

  console.log('transaction', transaction)

  return (
    <Link
      href={`/transaction/${transaction?.hash}`}
      className={'TransactionsListItem'}
    >
      <Grid className={`TransactionsListItem__Content ${!transaction?.timestamp && !transaction?.type ? 'TransactionsListItem__Content--Inline' : ''}`}>
        <GridItem className={'TransactionsListItem__Column TransactionsListItem__Column--Timestamp'}>
          {transaction?.timestamp
            ? <>
                <StatusIcon className={'TransactionsListItem__StatusIcon'} status={transaction.status} w={'18px'} h={'18px'} mr={'8px'}/>
                {getTimeDelta(new Date(), new Date(transaction.timestamp))}
              </>
            : 'n/a'
          }
        </GridItem>
        <GridItem className={'TransactionsListItem__Column TransactionsListItem__Column--Hash'}>
          {transaction?.hash && <Identifier styles={['highlight-both']}>{transaction.hash}</Identifier>}
        </GridItem>
        <GridItem className={'TransactionsListItem__Column TransactionsListItem__Column--GasUsed'}>
          {transaction?.gasUsed
            ? <RateTooltip
                credits={transaction.gasUsed}
                rate={rate}
                placement={'top'}
              >
                <span><Credits>{transaction.gasUsed}</Credits> Credits</span>
              </RateTooltip>
            : 'n/a'
          }
        </GridItem>
          <GridItem className={'TransactionsListItem__Column TransactionsListItem__Column--Owner'}>
            {transaction?.owner
              ? activeAlias
                ? <div className={'TransactionsListItem__AliasContainer'}>
                    <ImageGenerator className={'Identifier__Avatar'} username={transaction?.owner?.identifier} lightness={50} saturation={50} width={24} height={24} />
                    <Alias alias={activeAlias?.alias || activeAlias}/>
                  </div>
                : <Identifier avatar={true} styles={['highlight-both']}>{transaction?.owner?.identifier}</Identifier>
              : 'n/a'
            }
          </GridItem>
        <GridItem className={'TransactionsListItem__Column TransactionsListItem__Column--Type'}>
          {transaction?.type !== undefined
            ? <TypeBadge className={'TransactionsListItem__TypeBadge'} typeId={transaction.type}/>
            : 'n/a'
          }
        </GridItem>
      </Grid>
    </Link>
  )
}

export default TransactionsListItem
