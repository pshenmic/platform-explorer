'use client'

import Link from 'next/link'
import { Grid, GridItem } from '@chakra-ui/react'
import TypeBadge from './TypeBadge'
import { Identifier, BigNumber, Alias, TimeDelta, NotActive } from '../data'
import StatusIcon from './StatusIcon'
import { RateTooltip, Tooltip } from '../ui/Tooltips'
import ImageGenerator from '../imageGenerator'
import { useRouter } from 'next/navigation'
import { LinkContainer } from '../ui/containers'
import './TransactionsListItem.scss'

function TransactionsListItem ({ transaction, rate }) {
  const activeAlias = transaction?.owner?.aliases?.find(alias => alias.status === 'ok')
  const router = useRouter()

  const StatusIconWrapper = ({ children }) => (
    transaction.status !== 'SUCCESS'
      ? <Tooltip
          title={transaction.status}
          content={transaction?.error}
          placement={'top'}
        >
          <span>{children}</span>
        </Tooltip>
      : children
  )

  return (
    <Link href={`/transaction/${transaction?.hash}`} className={'TransactionsListItem'}>
      <Grid className={'TransactionsListItem__Content'}>
        <GridItem className={'TransactionsListItem__Column TransactionsListItem__Column--Timestamp'}>
          {transaction?.timestamp
            ? <>
                {transaction?.status &&
                  <StatusIconWrapper>
                    <StatusIcon className={'TransactionsListItem__StatusIcon'} status={transaction.status} w={'18px'} h={'18px'} mr={'8px'}/>
                  </StatusIconWrapper>
                }
                <TimeDelta endDate={new Date(transaction.timestamp)}/>
              </>
            : <NotActive/>
          }
        </GridItem>
        <GridItem className={'TransactionsListItem__Column TransactionsListItem__Column--Hash'}>
          {transaction?.hash
            ? <Identifier styles={['highlight-both']}>{transaction.hash}</Identifier>
            : <NotActive/>
          }
        </GridItem>
        <GridItem className={'TransactionsListItem__Column TransactionsListItem__Column--GasUsed'}>
          {transaction?.gasUsed
            ? <RateTooltip
                credits={transaction.gasUsed}
                rate={rate}
                placement={'top'}
              >
                <span><BigNumber>{transaction.gasUsed}</BigNumber> Credits</span>
              </RateTooltip>
            : <NotActive/>
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
              : <NotActive/>
            }
          </GridItem>
        <GridItem className={'TransactionsListItem__Column TransactionsListItem__Column--Type'}>
          {transaction?.type !== undefined
            ? <TypeBadge className={'TransactionsListItem__TypeBadge'} typeId={transaction.type}/>
            : <NotActive/>
          }
        </GridItem>
      </Grid>
    </Link>
  )
}

export default TransactionsListItem
