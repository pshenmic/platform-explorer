import type { ComponentType } from 'react'
import { CreditsBlock as CreditsBlockJs } from '../data'
import { LoadingLine } from '../loading'
import type { PlatformAddress, Rate } from '../../types'
import type { WithClassName } from '../../types/common'
import './PlatformAddressDigestCard.scss'

// Untyped JS until data/* is migrated
const CreditsBlock = CreditsBlockJs as ComponentType<{
  credits?: number | string | null
  rate?: { data?: Pick<Rate, 'usd'> | null } | null
}>

export interface PlatformAddressQueryLike {
  data?: PlatformAddress | null
  isLoading?: boolean
  isError?: boolean
}

interface PlatformAddressDigestCardProps extends WithClassName {
  address: PlatformAddressQueryLike
  rate?: { data?: Pick<Rate, 'usd'> | null } | null
}

function PlatformAddressDigestCard ({ address, rate, className }: PlatformAddressDigestCardProps) {
  return (
    <div className={`PlatformAddressDigestCard ${className || ''} ${address.isLoading ? 'PlatformAddressDigestCard--Loading' : ''}`}>
      <div className={'PlatformAddressDigestCard__Transfers'}>
        <div className={'PlatformAddressDigestCard__Transfer PlatformAddressDigestCard__Transfer--Incoming'}>
          <div className={'PlatformAddressDigestCard__TransferTitle'}>Incoming Amount:</div>
          <LoadingLine loading={address.isLoading}>
            <CreditsBlock credits={address.data?.totalIncomingAmount} rate={rate} />
          </LoadingLine>
        </div>
        <div className={'PlatformAddressDigestCard__Transfer PlatformAddressDigestCard__Transfer--Outgoing'}>
          <div className={'PlatformAddressDigestCard__TransferTitle'}>Outgoing Amount:</div>
          <LoadingLine loading={address.isLoading}>
            <CreditsBlock credits={address.data?.totalOutgoingAmount} rate={rate} />
          </LoadingLine>
        </div>
      </div>
    </div>
  )
}

export default PlatformAddressDigestCard
