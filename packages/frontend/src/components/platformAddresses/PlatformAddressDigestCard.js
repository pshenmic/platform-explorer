import { CreditsBlock } from '../data'
import { LoadingLine } from '../loading'
import './PlatformAddressDigestCard.scss'

function PlatformAddressDigestCard ({ address, rate, className }) {
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
