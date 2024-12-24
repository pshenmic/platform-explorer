'use client'

import { Grid, GridItem } from '@chakra-ui/react'
import { ValueContainer, LinkContainer } from '../ui/containers'
import { Credits, Identifier } from '../data'
import { RateTooltip } from '../ui/Tooltips'
import Link from 'next/link'
import { forwardRef, useRef, useState } from 'react'
import useResizeObserver from '@react-hook/resize-observer'
import { getTimeDelta } from '../../util'
import TypeBadge from './TypeBadge'
import './TransfersListItem.scss'

const mobileWidth = 580

function TransfersListItem ({ transfer, rate }) {
  const containerRef = useRef(null)
  const [isMobile, setIsMobile] = useState(false)
  const clickable = isMobile && transfer?.hash

  useResizeObserver(containerRef, () => {
    const { offsetWidth } = containerRef.current
    setIsMobile(offsetWidth <= mobileWidth)
  })

  const Wrapper = forwardRef(function Wrapper (props, ref) {
    return clickable
      ? <Link ref={ref} href={`/transaction/${transfer?.txHash}`} className={props.className}>{props.children}</Link>
      : <div ref={ref} className={props.className}>{props.children}</div>
  })

  const ItemWrapper = ({ isLocal, children, ...props }) => {
    return clickable
      ? <div {...props}>{children}</div>
      : isLocal
        ? <Link {...props}>{children}</Link>
        : <a {...props}>{children}</a>
  }

  const Recipient = () => {
    if (!transfer?.recipient) return <span className={'TransactionsListItem__NotActiveText'}>-</span>

    return (
      <LinkContainer href={`/identity/${transfer?.recipient}`}>
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
    <div ref={containerRef} className={`TransfersListItem ${clickable ? 'TransfersListItem--Clickable' : ''}`}>
      <Wrapper className={'TransfersListItem__ContentWrapper'}>
        <Grid className={'TransfersListItem__Content'}>
          <GridItem className={'TransfersListItem__Column TransfersListItem__Column--Timestamp'}>
            {transfer?.timestamp
              ? <span>{getTimeDelta(new Date(), new Date(transfer.timestamp))}</span>
              : <span className={'TransactionsListItem__NotActiveText'}>n/a</span>
            }
          </GridItem>

          <GridItem className={'TransfersListItem__Column TransfersListItem__Column--TxHash'}>
            {transfer?.txHash
              ? <ItemWrapper
                  className={'TransfersListItem__ColumnContent'} isLocal={true}
                  href={'/transaction/' + transfer.txHash}
                >
                <ValueContainer className={''} light={true} clickable={true} size={'xxs'}>
                  <Identifier styles={['highlight-both']}>{transfer.txHash}</Identifier>
                </ValueContainer>
              </ItemWrapper>
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
      </Wrapper>
    </div>
  )
}

export default TransfersListItem
