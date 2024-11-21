import { Grid, GridItem } from '@chakra-ui/react'
import { ArrowCornerIcon } from '../../ui/icons'
import { Identifier, Credits } from '../../data'
import { ValueContainer } from '../../ui/containers'
import { RateTooltip } from '../../ui/Tooltips'
import StatusIcon from './StatusIcon'
import Link from 'next/link'
import './WithdrawalsListItem.scss'
import { forwardRef, useRef, useState } from 'react'
import useResizeObserver from '@react-hook/resize-observer'

const mobileWidth = 550

function WithdrawalsListItem ({ withdrawal, rate, l1explorerBaseUrl }) {
  const containerRef = useRef(null)
  const [isMobile, setIsMobile] = useState(false)
  const clickable = isMobile && withdrawal?.hash

  useResizeObserver(containerRef, () => {
    const { offsetWidth } = containerRef.current
    setIsMobile(offsetWidth <= mobileWidth)
  })

  const Wrapper = forwardRef(function Wrapper (props, ref) {
    return clickable
      ? <Link ref={ref} href={`/transaction/${withdrawal?.hash}`} >{props.children}</Link>
      : <div ref={ref} className={props.className}>{props.children}</div>
  })

  const ItemWrapper = ({ isLocal, children, ...props }) => {
    return clickable
      ? <div {...props}>{children}</div>
      : isLocal
        ? <Link {...props}>{children}</Link>
        : <a {...props}>{children}</a>
  }

  return (
    <div ref={containerRef} className={`WithdrawalsListItem ${clickable ? 'WithdrawalsListItem--Clickable' : ''}`}>
      <Wrapper className={'WithdrawalsListItem__ContentWrapper'}>
        <Grid className={'WithdrawalsListItem__Content'}>
          <GridItem className={'WithdrawalsListItem__Column WithdrawalsListItem__Column--Timestamp'}>
            {new Date(withdrawal.timestamp).toLocaleString()}
          </GridItem>

          <GridItem className={'WithdrawalsListItem__Column WithdrawalsListItem__Column--TxHash'}>
            {withdrawal?.hash
              ? <ItemWrapper isLocal={true} href={'/transaction/' + withdrawal.hash}>
                  <ValueContainer className={''} light={true} clickable={true}>
                    <Identifier styles={['highlight-both']}>{withdrawal.hash}</Identifier>
                  </ValueContainer>
                </ItemWrapper>
              : '-'
            }
          </GridItem>

          <GridItem className={'WithdrawalsListItem__Column WithdrawalsListItem__Column--Address'}>
            {withdrawal?.recipient
              ? <ItemWrapper
                  isLocal={false}
                  {...(l1explorerBaseUrl ? { href: `${l1explorerBaseUrl}/address/${withdrawal?.recipient}` } : {})}
                  target={l1explorerBaseUrl ? '_blank' : '_self'}
                  rel={'noopener noreferrer'}
                >
                  <ArrowCornerIcon color={'brand.normal'} w={'10px'} h={'10px'} mr={'10px'}/>
                  <Identifier styles={['highlight-both']}>{withdrawal.recipient}</Identifier>
                </ItemWrapper>
              : '-'
            }
          </GridItem>

          <GridItem className={'WithdrawalsListItem__Column WithdrawalsListItem__Column--Document'}>
            {withdrawal?.document
              ? <ItemWrapper isLocal={true} href={'/document/' + withdrawal.recipient}>
                  <ValueContainer className={''} light={true} clickable={true}>
                    <Identifier styles={['highlight-both']}>{withdrawal.recipient}</Identifier>
                  </ValueContainer>
                </ItemWrapper>
              : '-'
            }
          </GridItem>

          <GridItem className={'WithdrawalsListItem__Column WithdrawalsListItem__Column--Amount'}>
            <RateTooltip credits={withdrawal.amount} rate={rate}>
              <span><Credits>{withdrawal.amount}</Credits></span>
            </RateTooltip>
          </GridItem>

          <GridItem className={'WithdrawalsListItem__Column WithdrawalsListItem__Column--Status'}>
            <StatusIcon status={withdrawal.status} w={'18px'} h={'18px'}/>
          </GridItem>
        </Grid>
      </Wrapper>
    </div>
  )
}

export default WithdrawalsListItem
