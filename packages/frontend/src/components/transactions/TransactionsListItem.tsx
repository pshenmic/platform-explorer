'use client'

import type { ComponentType, ReactNode } from 'react'
import Link from 'next/link'
import { Grid, GridItem } from '@chakra-ui/react'
import TypeBadge from './TypeBadge'
import BatchTypeBadge from './BatchTypeBadge'
import TransactionStatusBadge from './TransactionStatusBadge'
// Untyped JS components — loose wrappers until data/* is migrated
import {
  Identifier as IdentifierJs,
  BigNumber as BigNumberJs,
  Alias as AliasJs,
  TimeDelta as TimeDeltaJs,
  NotActive as NotActiveJs,
  DateBlock as DateBlockJs
} from '../data'
import { RateTooltip } from '../ui/Tooltips'
import ImageGenerator from '../imageGenerator'
import { useRouter } from 'next/navigation'
import { LinkContainer } from '../ui/containers'
import type { Rate, Transaction } from '../../types'

import './TransactionsListItem.css'

const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  avatar?: boolean
  styles?: string[]
  clickable?: boolean
  ellipsis?: boolean
  middleEllipsis?: boolean
  copyButton?: boolean
  className?: string
}>
const BigNumber = BigNumberJs as ComponentType<{ children?: ReactNode; className?: string }>
const Alias = AliasJs as ComponentType<{
  children?: ReactNode
  alias?: string | { alias?: string } | null
  status?: string
  avatarSource?: string | null
  ellipsis?: boolean
  className?: string
}>
const TimeDelta = TimeDeltaJs as ComponentType<{
  endDate?: string | Date | null
  startDate?: string | Date | null
  showTimestampTooltip?: boolean
  tooltipDate?: string | Date | null
  format?: string
}>
const NotActive = NotActiveJs as ComponentType<{ children?: ReactNode; className?: string }>
const DateBlock = DateBlockJs as ComponentType<{
  timestamp?: string | number | Date | null
  format?: string
  showTime?: boolean
  showRelativeTooltip?: boolean
}>

interface TransactionsListItemProps {
  transaction: Transaction
  rate?: Pick<Rate, 'usd'> | null
  absoluteDate?: boolean
}

function TransactionsListItem({ transaction, rate, absoluteDate }: TransactionsListItemProps) {
  const activeAlias = transaction?.owner?.aliases?.find(alias => alias.status === 'ok')
  const router = useRouter()

  return (
    <Link href={`/transaction/${transaction?.hash}`} className={'TransactionsListItem'}>
      <Grid className={'TransactionsListItem__Content'}>
        <GridItem className={'TransactionsListItem__Column TransactionsListItem__Column--Status'}>
          {transaction?.status ? (
            <TransactionStatusBadge status={transaction.status} />
          ) : (
            <NotActive />
          )}
        </GridItem>
        <GridItem className={'TransactionsListItem__Column TransactionsListItem__Column--Hash'}>
          {transaction?.hash ? (
            <Identifier middleEllipsis={true} copyButton={true}>
              {transaction.hash}
            </Identifier>
          ) : (
            <NotActive />
          )}
        </GridItem>
        <GridItem className={'TransactionsListItem__Column TransactionsListItem__Column--Block'}>
          {transaction?.blockHeight != null ? (
            <LinkContainer
              className={'TransactionsListItem__BlockLink'}
              onClick={e => {
                e.stopPropagation()
                e.preventDefault()
                router.push(`/block/${transaction?.blockHash}`)
              }}
            >
              <BigNumber>{transaction.blockHeight}</BigNumber>
            </LinkContainer>
          ) : (
            <NotActive />
          )}
        </GridItem>
        <GridItem className={'TransactionsListItem__Column TransactionsListItem__Column--GasUsed'}>
          {transaction?.gasUsed ? (
            <RateTooltip credits={transaction.gasUsed} rate={rate} placement={'top'}>
              <span>
                <BigNumber>{transaction.gasUsed}</BigNumber> Credits
              </span>
            </RateTooltip>
          ) : (
            <NotActive />
          )}
        </GridItem>
        <GridItem className={'TransactionsListItem__Column TransactionsListItem__Column--Owner'}>
          {transaction?.owner?.identifier ? (
            <LinkContainer
              className={'TransactionsListItem__OwnerLink'}
              onClick={e => {
                e.stopPropagation()
                e.preventDefault()
                router.push(`/identity/${transaction?.owner?.identifier}`)
              }}
            >
              {activeAlias ? (
                <div className={'TransactionsListItem__AliasContainer'}>
                  <ImageGenerator
                    className={'Identifier__Avatar'}
                    username={transaction?.owner?.identifier}
                    lightness={50}
                    saturation={50}
                    width={24}
                    height={24}
                  />
                  <Alias alias={activeAlias?.alias || activeAlias} />
                </div>
              ) : (
                <Identifier avatar={true} copyButton={true} middleEllipsis={true}>
                  {transaction?.owner?.identifier}
                </Identifier>
              )}
            </LinkContainer>
          ) : (
            <NotActive>-</NotActive>
          )}
        </GridItem>
        <GridItem className={'TransactionsListItem__Column TransactionsListItem__Column--Type'}>
          {transaction?.batchType ? (
            <BatchTypeBadge
              className={'TransactionsListItem__TypeBadge'}
              batchType={transaction.batchType?.replace(/[\\""]/g, '')}
            />
          ) : transaction?.type !== undefined ? (
            <TypeBadge className={'TransactionsListItem__TypeBadge'} type={transaction.type} />
          ) : (
            <NotActive />
          )}
        </GridItem>
        <GridItem
          className={'TransactionsListItem__Column TransactionsListItem__Column--Timestamp'}
        >
          {transaction?.timestamp ? (
            absoluteDate ? (
              <DateBlock
                format={'dateOnly'}
                showTime={true}
                timestamp={transaction.timestamp}
                showRelativeTooltip={true}
              />
            ) : (
              <TimeDelta showTimestampTooltip={true} endDate={new Date(transaction.timestamp)} />
            )
          ) : (
            <NotActive />
          )}
        </GridItem>
      </Grid>
    </Link>
  )
}

export default TransactionsListItem
