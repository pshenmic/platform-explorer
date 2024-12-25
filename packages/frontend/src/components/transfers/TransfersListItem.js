'use client'

import { Grid, GridItem } from '@chakra-ui/react'
import { LinkContainer } from '../ui/containers'
import { Credits, Identifier } from '../data'
import { RateTooltip } from '../ui/Tooltips'
import Link from 'next/link'
import { useRef } from 'react'
import { getTimeDelta } from '../../util'
import TypeBadge from './TypeBadge'
import { useRouter } from 'next/navigation'
import './TransfersListItem.scss'

function TransfersListItem ({ transfer, rate }) {
  const containerRef = useRef(null)
  const router = useRouter()

  const Recipient = () => {
    if (!transfer?.recipient) return <span className={'TransactionsListItem__NotActiveText'}>-</span>

    return (
      <LinkContainer
        onClick={e => {
          e.stopPropagation()
          e.preventDefault()
          router.push(`/identity/${transfer?.recipient}`)
        }}
      >
        <Identifier
          avatar={true}
          styles={['highlight-both']}
          clickable={true}
        >
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
          {transfer?.timestamp
            ? <span>{getTimeDelta(new Date(), new Date(transfer.timestamp))}</span>
            : <span className={'TransactionsListItem__NotActiveText'}>n/a</span>
          }
        </GridItem>

        <GridItem className={'TransfersListItem__Column TransfersListItem__Column--TxHash'}>
          {transfer?.txHash
            ? <Identifier styles={['highlight-both']}>{transfer.txHash}</Identifier>
            : <span className={'TransactionsListItem__NotActiveText'}>n/a</span>
          }
        </GridItem>

        <GridItem className={'TransfersListItem__Column TransfersListItem__Column--Recipient'}>
          <Recipient/>
        </GridItem>

        <GridItem className={'TransfersListItem__Column TransfersListItem__Column--Amount'}>
          {transfer?.amount
            ? <RateTooltip credits={transfer.amount} rate={rate}>
                <span><Credits>{transfer.amount}</Credits></span>
              </RateTooltip>
            : <span className={'TransactionsListItem__NotActiveText'}>-</span>
          }
        </GridItem>

        <GridItem className={'TransfersListItem__Column TransfersListItem__Column--GasUsed'}>
          {transfer?.gasUsed
            ? <RateTooltip credits={transfer.gasUsed} rate={rate}>
                <span><Credits>{transfer.gasUsed}</Credits></span>
              </RateTooltip>
            : <span className={'TransactionsListItem__NotActiveText'}>-</span>
          }
        </GridItem>

        <GridItem className={'TransfersListItem__Column TransfersListItem__Column--Type'}>
          <TypeBadge type={transfer.type}/>
        </GridItem>
      </Grid>
    </Link>
  )
}

export default TransfersListItem
