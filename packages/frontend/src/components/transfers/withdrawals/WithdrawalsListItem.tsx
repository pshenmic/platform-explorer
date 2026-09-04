import type { ComponentType, ReactNode, AnchorHTMLAttributes, HTMLAttributes, Ref } from 'react'

import { ArrowCornerIcon } from '../../ui/icons'
// Untyped JS components — loose wrappers until data/* is migrated
import { Identifier as IdentifierJs, BigNumber as BigNumberJs } from '../../data'
import { ValueContainer } from '../../ui/containers'
import { RateTooltip } from '../../ui/Tooltips'
import StatusIcon from './StatusIcon'
import Link from 'next/link'
import './WithdrawalsListItem.css'
import { forwardRef, useRef, useState } from 'react'
import useResizeObserver from '@react-hook/resize-observer'
import type { Rate, Withdrawal } from '../../../types'

const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  avatar?: boolean
  styles?: string[]
  clickable?: boolean
  ellipsis?: boolean
  copyButton?: boolean
  className?: string
}>
const BigNumber = BigNumberJs as ComponentType<{ children?: ReactNode; className?: string }>

const mobileWidth = 550

/** API withdrawal rows may include fields beyond the core Withdrawal model. */
export interface WithdrawalListItem extends Withdrawal {
  withdrawalAddress?: string | null
  document?: string | null
}

interface WithdrawalsListItemProps {
  withdrawal: WithdrawalListItem
  rate?: Pick<Rate, 'usd'> | null
  defaultPayoutAddress?: string | null
  l1explorerBaseUrl?: string | null
}

function WithdrawalsListItem({
  withdrawal,
  rate,
  defaultPayoutAddress,
  l1explorerBaseUrl
}: WithdrawalsListItemProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const clickable = isMobile && Boolean(withdrawal?.hash)
  const withdrawalAddress = withdrawal?.withdrawalAddress || defaultPayoutAddress

  useResizeObserver(containerRef as never, () => {
    const offsetWidth = containerRef.current?.offsetWidth ?? 0
    setIsMobile(offsetWidth <= mobileWidth)
  })

  const Wrapper = forwardRef<
    HTMLAnchorElement | HTMLDivElement,
    { className?: string; children?: ReactNode }
  >(function Wrapper(props, ref) {
    return clickable ? (
      <Link
        ref={ref as Ref<HTMLAnchorElement>}
        href={`/transaction/${withdrawal?.hash}`}
        className={props.className}
      >
        {props.children}
      </Link>
    ) : (
      <div ref={ref as Ref<HTMLDivElement>} className={props.className}>
        {props.children}
      </div>
    )
  })

  type ItemWrapperProps = {
    isLocal?: boolean
    children?: ReactNode
  } & HTMLAttributes<HTMLElement> &
    AnchorHTMLAttributes<HTMLAnchorElement>

  const ItemWrapper = ({ isLocal, children, ...props }: ItemWrapperProps) => {
    return clickable ? (
      <div {...(props as HTMLAttributes<HTMLDivElement>)}>{children}</div>
    ) : isLocal ? (
      <Link href={props.href ?? '#'} {...props}>
        {children}
      </Link>
    ) : (
      <a {...props}>{children}</a>
    )
  }

  const amountCredits = withdrawal.amount != null ? Number(withdrawal.amount) : undefined

  return (
    <div
      ref={containerRef}
      className={`WithdrawalsListItem ${clickable ? 'WithdrawalsListItem--Clickable' : ''}`}
    >
      <Wrapper className={'WithdrawalsListItem__ContentWrapper'}>
        <div className={'WithdrawalsListItem__Content'}>
          <div
            className={'WithdrawalsListItem__Column WithdrawalsListItem__Column--Timestamp'}
          >
            {withdrawal.timestamp ? new Date(withdrawal.timestamp).toLocaleString() : '-'}
          </div>

          <div className={'WithdrawalsListItem__Column WithdrawalsListItem__Column--TxHash'}>
            {withdrawal?.hash ? (
              <ItemWrapper
                className={'WithdrawalsListItem__ColumnContent'}
                isLocal={true}
                href={'/transaction/' + withdrawal.hash}
              >
                <ValueContainer className={''} light={true} clickable={true}>
                  <Identifier styles={['highlight-both']}>{withdrawal.hash}</Identifier>
                </ValueContainer>
              </ItemWrapper>
            ) : (
              '-'
            )}
          </div>

          <div className={'WithdrawalsListItem__Column WithdrawalsListItem__Column--Address'}>
            {withdrawalAddress ? (
              <ItemWrapper
                className={'WithdrawalsListItem__ColumnContent'}
                isLocal={false}
                {...(l1explorerBaseUrl
                  ? { href: `${l1explorerBaseUrl}/address/${withdrawalAddress}` }
                  : {})}
                target={l1explorerBaseUrl ? '_blank' : '_self'}
                rel={'noopener noreferrer'}
              >
                <ArrowCornerIcon color={'brand.normal'} w={'10px'} h={'10px'} mr={'10px'} />
                <Identifier styles={['highlight-both']}>{withdrawalAddress}</Identifier>
              </ItemWrapper>
            ) : (
              '-'
            )}
          </div>

          <div className={'WithdrawalsListItem__Column WithdrawalsListItem__Column--Document'}>
            {withdrawal?.document ? (
              <ItemWrapper
                className={'WithdrawalsListItem__ColumnContent'}
                isLocal={true}
                href={
                  '/document/' +
                  withdrawal.document +
                  '?document-type-name=withdrawal&contract-id=4fJLR2GYTPFdomuTVvNy3VRrvWgvkKPzqehEBpNf2nk6'
                }
              >
                <ValueContainer className={''} light={true} clickable={true}>
                  <Identifier styles={['highlight-both']}>{withdrawal.document}</Identifier>
                </ValueContainer>
              </ItemWrapper>
            ) : (
              '-'
            )}
          </div>

          <div className={'WithdrawalsListItem__Column WithdrawalsListItem__Column--Amount'}>
            <RateTooltip credits={amountCredits} rate={rate}>
              <span>
                <BigNumber>{withdrawal.amount}</BigNumber>
              </span>
            </RateTooltip>
          </div>

          <div className={'WithdrawalsListItem__Column WithdrawalsListItem__Column--Status'}>
            <StatusIcon status={withdrawal.status} w={'18px'} h={'18px'} />
          </div>
        </div>
      </Wrapper>
    </div>
  )
}

export default WithdrawalsListItem
