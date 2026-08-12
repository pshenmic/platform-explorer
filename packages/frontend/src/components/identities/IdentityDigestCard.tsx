import type { ComponentType, ReactNode } from 'react'
import type { Identity, Rate } from '../../types'
import type { LoadableState } from '../../types/common'
import { CreditsBlock as CreditsBlockJs, DateBlock as DateBlockJs, Identifier as IdentifierJs, InfoLine as InfoLineJs } from '../data'
import Link from 'next/link'
import { ValueContainer } from '../ui/containers'
import { LoadingLine } from '../loading'
import { useActiveNetwork } from 'src/contexts'

import './IdentityDigestCard.scss'

// Untyped JS modules — cast until migrated
const CreditsBlock = CreditsBlockJs as ComponentType<{ credits?: number | string | null, rate?: Rate | null }>
const DateBlock = DateBlockJs as ComponentType<{
  timestamp?: string | number | null
  format?: string
  showTime?: boolean
  showRelativeTooltip?: boolean
}>
const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  className?: string
  avatar?: boolean
  ellipsis?: boolean
  middleEllipsis?: boolean
  copyButton?: boolean
  styles?: string[]
  clickable?: boolean
  alias?: string
}>
const InfoLine = InfoLineJs as ComponentType<{
  className?: string
  title?: ReactNode
  value?: ReactNode
  loading?: boolean
  error?: boolean
}>

interface IdentityDigestCardProps {
  identity: LoadableState<Identity>
  rate?: Rate | null
  className?: string
}

function IdentityDigestCard ({ identity, rate, className }: IdentityDigestCardProps) {
  const { l1explorerBaseUrl } = useActiveNetwork()

  return (
    <div className={`IdentityDigestCard ${className || ''} ${identity.loading ? 'IdentityDigestCard--Loading' : ''}`}>
      <div className={'IdentityDigestCard__Transfers'}>
        <div className={'IdentityDigestCard__Transfer IdentityDigestCard__Transfer--TupUp'}>
          <div className={'IdentityDigestCard__TransferTitle'}>Total Top-up’s:</div>
          <LoadingLine loading={identity.loading}>
            <CreditsBlock credits={identity.data?.totalTopUpsAmount} rate={rate}/>
          </LoadingLine>
        </div>
        <div className={'IdentityDigestCard__Transfer IdentityDigestCard__Transfer--Withdrawals'}>
          <div className={'IdentityDigestCard__TransferTitle'}>Total Withdrawals:</div>
          <LoadingLine loading={identity.loading}>
            <CreditsBlock credits={identity.data?.totalWithdrawalsAmount} rate={rate}/>
          </LoadingLine>
        </div>
      </div>

      <div className={'IdentityDigestCard__LinesContainer'}>
        <InfoLine
          className={'IdentityDigestCard__InfoLine'}
          title={'Funding Core Transaction'}
          value={(
            <a {...(l1explorerBaseUrl && {
              href: `${l1explorerBaseUrl}/tx/${identity.data?.fundingCoreTx}`,
              target: '_blank',
              rel: 'noopener noreferrer'
            })}>
              <ValueContainer className={'IdentityDigestCard__ValueContainer'} clickable={!!l1explorerBaseUrl} external={!!l1explorerBaseUrl}>
                <Identifier styles={['highlight-both']} ellipsis={false}>
                  {identity.data?.fundingCoreTx || null}
                </Identifier>
              </ValueContainer>
            </a>
          )}
          loading={identity.loading}
          error={identity.error || (!identity.loading && !identity.data?.fundingCoreTx)}
        />
        <InfoLine
          className={'IdentityDigestCard__InfoLine IdentityDigestCard__InfoLine--LastWithdrawal'}
          title={'Last Withdrawal'}
          value={(
            <Link href={`/transaction/${identity.data?.lastWithdrawalHash}`}>
              <ValueContainer className={'IdentityDigestCard__ValueContainer'} clickable={true}>
                {identity.data?.lastWithdrawalTimestamp &&
                  <DateBlock timestamp={identity.data?.lastWithdrawalTimestamp} format={'deltaOnly'}/>
                }
                <Identifier ellipsis={false} styles={['highlight-both']}>
                  {identity.data?.lastWithdrawalHash}
                </Identifier>
              </ValueContainer>
            </Link>
          )}
          loading={identity.loading}
          error={identity.error || (!identity.loading && !identity.data?.lastWithdrawalHash)}
        />
        <InfoLine
          className={'IdentityDigestCard__InfoLine'}
          title={'Total Gas Spent'}
          value={<CreditsBlock credits={identity.data?.totalGasSpent} rate={rate}/>}
          loading={identity.loading}
          error={identity.error || (!identity.loading && identity.data?.totalGasSpent === undefined)}
        />
        <InfoLine
          className={'IdentityDigestCard__InfoLine'}
          title={'Average Gas Spent'}
          value={<CreditsBlock credits={identity.data?.averageGasSpent} rate={rate}/>}
          loading={identity.loading}
          error={identity.error || (!identity.loading && identity.data?.averageGasSpent === undefined)}
        />
      </div>
    </div>
  )
}

export default IdentityDigestCard
