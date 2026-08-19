'use client'

import type { ComponentType, ReactNode } from 'react'
import { Grid, GridItem } from '@chakra-ui/react'
import { LinkContainer } from '../ui/containers'
// Untyped JS components — loose wrappers until data/* is migrated
import {
  BigNumber as BigNumberJs,
  Identifier as IdentifierJs,
  NotActive as NotActiveJs,
  TimeDelta as TimeDeltaJs
} from '../data'
import { RateTooltip } from '../ui/Tooltips'
import Link from 'next/link'
import { useRef } from 'react'
import TypeBadge from './TypeBadge'
import { useRouter } from 'next/navigation'
import type { Rate, Transfer } from '../../types'
import './TransfersListItem.css'

const BigNumber = BigNumberJs as ComponentType<{ children?: ReactNode; className?: string }>
const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  avatar?: boolean
  styles?: string[]
  clickable?: boolean
  ellipsis?: boolean
  copyButton?: boolean
  middleEllipsis?: boolean
  className?: string
}>
const NotActive = NotActiveJs as ComponentType<{ children?: ReactNode; className?: string }>
const TimeDelta = TimeDeltaJs as ComponentType<{
  endDate?: string | Date | null
  startDate?: string | Date | null
  showTimestampTooltip?: boolean
  tooltipDate?: string | Date | null
  format?: string
}>

interface TransfersListItemProps {
  transfer: Transfer
  rate?: Pick<Rate, 'usd'> | null
}

function TransfersListItem({ transfer, rate }: TransfersListItemProps) {
  const containerRef = useRef<HTMLAnchorElement>(null)
  const router = useRouter()

  const Recipient = () => {
    if (!transfer?.recipient) return <NotActive>-</NotActive>

    return (
      <LinkContainer
        onClick={e => {
          e.stopPropagation()
          e.preventDefault()
          router.push(`/identity/${transfer?.recipient}`)
        }}
      >
        <Identifier avatar={true} styles={['highlight-both']} clickable={true}>
          {transfer.recipient}
        </Identifier>
      </LinkContainer>
    )
  }

  return (
    <Link
      href={`/transaction/${transfer?.txHash}`}
      ref={containerRef}
      className={'TransfersListItem TransfersListItem--Clickable'}
    >
      <Grid className={'TransfersListItem__Content'}>
        <GridItem className={'TransfersListItem__Column TransfersListItem__Column--Timestamp'}>
          {transfer?.timestamp ? (
            <span>
              <TimeDelta endDate={transfer.timestamp} />
            </span>
          ) : (
            <NotActive />
          )}
        </GridItem>

        <GridItem className={'TransfersListItem__Column TransfersListItem__Column--TxHash'}>
          {transfer?.txHash ? (
            <Identifier styles={['highlight-both']}>{transfer.txHash}</Identifier>
          ) : (
            <NotActive />
          )}
        </GridItem>

        <GridItem className={'TransfersListItem__Column TransfersListItem__Column--Recipient'}>
          <Recipient />
        </GridItem>

        <GridItem className={'TransfersListItem__Column TransfersListItem__Column--Amount'}>
          {transfer?.amount ? (
            <RateTooltip credits={transfer.amount} rate={rate}>
              <span>
                <BigNumber>{transfer.amount}</BigNumber>
              </span>
            </RateTooltip>
          ) : (
            <NotActive>-</NotActive>
          )}
        </GridItem>

        <GridItem className={'TransfersListItem__Column TransfersListItem__Column--GasUsed'}>
          {transfer?.gasUsed ? (
            <RateTooltip credits={transfer.gasUsed} rate={rate}>
              <span>
                <BigNumber>{transfer.gasUsed}</BigNumber>
              </span>
            </RateTooltip>
          ) : (
            <NotActive>-</NotActive>
          )}
        </GridItem>

        <GridItem className={'TransfersListItem__Column TransfersListItem__Column--Type'}>
          {transfer?.type ? <TypeBadge type={transfer?.type} /> : <NotActive />}
        </GridItem>
      </Grid>
    </Link>
  )
}

export default TransfersListItem
