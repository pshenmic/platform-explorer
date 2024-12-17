'use client'

import { Grid, GridItem } from '@chakra-ui/react'
import './TransfersListItem.scss'
import { ValueContainer } from '../ui/containers'
import { Credits, Identifier } from '../data'
import { RateTooltip } from '../ui/Tooltips'
import Link from 'next/link'
import { forwardRef, useRef, useState } from 'react'
import useResizeObserver from '@react-hook/resize-observer'
import { getTimeDelta } from '../../util'
import TypeBadge from './TypeBadge'

const mobileWidth = 580

function TransfersListItem ({ transfer, identityId, rate, l1explorerBaseUrl }) {
  const containerRef = useRef(null)
  const [isMobile, setIsMobile] = useState(false)
  const clickable = isMobile && transfer?.hash

  const transferType = transfer.recipient === identityId
    ? transfer.sender ? 'CREDIT_TRANSFER' : 'TOP_UP'
    : transfer.recipient ? 'CREDIT_TRANSFER' : 'CREDIT_WITHDRAWAL'

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
    return (
      <Identifier avatar={true}>{transfer.recipient}</Identifier>
    )
  }

  return (
    <Wrapper className={'TransfersListItem'} ref={containerRef}>
      <Grid className={'TransfersListItem__Content'}>
        <GridItem className={'TransfersListItem__Column TransfersListItem__Column--Timestamp'}>
          {transfer?.timestamp
            ? <span>{getTimeDelta(new Date(), new Date(transfer.timestamp))}</span>
            : <span className={'TransactionsListItem__NotActiveText'}>n/a</span>
          }
        </GridItem>

        <GridItem className={'TransfersListItem__Column TransfersListItem__Column--TxHash'}>
          {transfer?.txHash
            ? <ItemWrapper className={'TransfersListItem__ColumnContent'} isLocal={true} href={'/transaction/' + transfer.txHash}>
              <ValueContainer className={''} light={true} clickable={true} size={'xxs'}>
                <Identifier styles={['highlight-both']}>{transfer.txHash}</Identifier>
              </ValueContainer>
            </ItemWrapper>
            : '-'
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
            : '-'
          }
        </GridItem>

        <GridItem className={'TransfersListItem__Column TransfersListItem__Column--GasUsed'}>
          {transfer?.gasUsed
            ? <RateTooltip credits={transfer.gasUsed} rate={rate}>
                <span><Credits>{transfer.gasUsed}</Credits></span>
              </RateTooltip>
            : '-'
          }
        </GridItem>

        <GridItem className={'TransfersListItem__Column TransfersListItem__Column--Type'}>
          <TypeBadge type={transferType}/>
        </GridItem>
      </Grid>
    </Wrapper>
  )

  // return (
  //   <div className={'TransfersListItem'}>
  //       <span className={'TransfersListItem__Amount'}>
  //           { amount } Credits
  //       </span>
  //
  //       <div className={'TransfersListItem__Timestamp'}>
  //           {new Date(timestamp).toLocaleString()}
  //       </div>
  //
  //       <div className={'TransfersListItem__InfoLine'}>
  //           <div className={'TransfersListItem__Type'}>
  //               <Tag bg='whiteAlpha.200' mr={'2'}>
  //                   { typeIcon } <Box w={1}/> { typeTitle }
  //               </Tag>
  //           </div>
  //
  //           {(counterparty !== null &&
  //               <span
  //                   className={'TransfersListItem__Counterparty'}
  //                   title={direction}
  //               >
  //                   { counterparty }
  //               </span>
  //           )}
  //       </div>
  //   </div>
  // )
}

export default TransfersListItem
