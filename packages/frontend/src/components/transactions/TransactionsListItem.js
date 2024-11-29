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
import { useRouter } from 'next/navigation'

function TransactionsListItem ({ transaction, rate, variant = 'full' }) {
  const activeAlias = transaction?.owner?.aliases?.find(alias => alias.status === 'ok')
  const router = useRouter()

  if (variant === 'hashes') {
    return (
      <Link
        href={`/transaction/${transaction?.hash}`}
        className={'TransactionsListItem'}
      >
        <Identifier styles={['highlight-both']}>{transaction?.hash}</Identifier>
      </Link>
    )
  }

  return (
    <Link
      href={`/transaction/${transaction?.hash}`}
      className={'TransactionsListItem'}
    >
      <Grid className={`TransactionsListItem__Content ${!transaction?.timestamp && !transaction?.type ? 'TransactionsListItem__Content--Inline' : ''}`}>
        <GridItem className={'TransactionsListItem__Column TransactionsListItem__Column--Timestamp'}>
          {transaction?.timestamp
            ? <>
                {transaction?.status &&
                  <StatusIcon className={'TransactionsListItem__StatusIcon'} status={transaction.status} w={'18px'} h={'18px'} mr={'8px'}/>
                }
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
              ? <div
                  className={'TransactionsListItem__OwnerLink'}
                  onClick={e => {
                    e.stopPropagation()
                    e.preventDefault()
                    router.push(`/identity/${transaction?.owner?.identifier}`)
                  }}
                >
                  {activeAlias
                    ? <div className={'TransactionsListItem__AliasContainer'}>
                      <ImageGenerator className={'Identifier__Avatar'} username={transaction?.owner?.identifier}
                                      lightness={50} saturation={50} width={24} height={24}/>
                      <Alias alias={activeAlias?.alias || activeAlias}/>
                    </div>
                    : <Identifier avatar={true} styles={['highlight-both']}>{transaction?.owner?.identifier}</Identifier>
                  }
                </div>
              : <span>n/a</span>
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
