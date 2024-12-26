'use client'

import Link from 'next/link'
import { getTimeDelta } from '../../util/index'
import { Grid, GridItem } from '@chakra-ui/react'
import TypeBadge from './TypeBadge'
import { Identifier, Credits, Alias } from '../data'
import StatusIcon from './StatusIcon'
import { RateTooltip } from '../ui/Tooltips'
import ImageGenerator from '../imageGenerator'
import { useRouter } from 'next/navigation'
import { LinkContainer } from '../ui/containers'
import './TransactionsListItem.scss'

function TransactionsListItem ({ transaction, rate }) {
  const activeAlias = transaction?.owner?.aliases?.find(alias => alias.status === 'ok')
  const router = useRouter()

  return (
    <Link href={`/transaction/${transaction?.hash}`} className={'TransactionsListItem'}>
      <Grid className={'TransactionsListItem__Content'}>
        <GridItem className={'TransactionsListItem__Column TransactionsListItem__Column--Timestamp'}>
          {transaction?.timestamp
            ? <>
                {transaction?.status &&
                  <StatusIcon className={'TransactionsListItem__StatusIcon'} status={transaction.status} w={'18px'} h={'18px'} mr={'8px'}/>
                }
                {getTimeDelta(new Date(), new Date(transaction.timestamp))}
              </>
            : <span className={'TransactionsListItem__NotActiveText'}>n/a</span>
          }
        </GridItem>
        <GridItem className={'TransactionsListItem__Column TransactionsListItem__Column--Hash'}>
          {transaction?.hash
            ? <Identifier styles={['highlight-both']}>{transaction.hash}</Identifier>
            : <span className={'TransactionsListItem__NotActiveText'}>n/a</span>
          }
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
            : <span className={'TransactionsListItem__NotActiveText'}>n/a</span>
          }
        </GridItem>
          <GridItem className={'TransactionsListItem__Column TransactionsListItem__Column--Owner'}>
            {transaction?.owner
              ? <LinkContainer
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
                </LinkContainer>
              : <span className={'TransactionsListItem__NotActiveText'}>n/a</span>
            }
          </GridItem>
        <GridItem className={'TransactionsListItem__Column TransactionsListItem__Column--Type'}>
          {transaction?.type !== undefined
            ? <TypeBadge className={'TransactionsListItem__TypeBadge'} typeId={transaction.type}/>
            : <span className={'TransactionsListItem__NotActiveText'}>n/a</span>
          }
        </GridItem>
      </Grid>
    </Link>
  )
}

export default TransactionsListItem
