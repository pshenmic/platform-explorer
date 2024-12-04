import './IdentityDigestCard.scss'
import { CreditsBlock, DateBlock, Identifier, InfoLine } from '../../../components/data'
import Link from 'next/link'
import { ValueContainer } from '../../../components/ui/containers'
import { LoadingLine } from '../../../components/loading'
import { networks } from '../../../constants/networks'

function IdentityDigestCard ({ identity, rate, className }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const activeNetwork = networks.find(network => network.explorerBaseUrl === baseUrl)
  const l1explorerBaseUrl = activeNetwork?.l1explorerBaseUrl || null

  if (!identity.data?.lastWithdrawal) identity.data.lastWithdrawal = '6AC5EDA942093A9275A2837CFDF2C18CAAD9D922BA211BD5EA5E6333FE904CE7'
  if (!identity.data?.lastWithdrawalTime) identity.data.lastWithdrawalTime = '2024-11-21T10:26:04.053Z'
  if (!identity.data?.fundingAddress) identity.data.fundingAddress = '=yS9GnnRdzX9W9G9kxihdgB5VovKWbPGjS1'

  return (
    <div className={`IdentityDigestCard ${className || ''}`}>
      <div className={'IdentityDigestCard__Transfers'}>
        <div className={'IdentityDigestCard__Transfer IdentityDigestCard__Transfer--TupUp'}>
          <div className={'IdentityDigestCard__TransferTitle'}>Total Top-up’s:</div>
          <LoadingLine loading={identity.loading}>
            <CreditsBlock credits={100000} rate={rate}/>
          </LoadingLine>
        </div>
        <div className={'IdentityDigestCard__Transfer IdentityDigestCard__Transfer--Withdrawals'}>
          <div className={'IdentityDigestCard__TransferTitle'}>Total Withdrawals:</div>
          <LoadingLine loading={identity.loading}>
            <CreditsBlock credits={10000} rate={rate}/>
          </LoadingLine>
        </div>
      </div>

      <div className={'IdentityDigestCard__LinesContainer'}>
        <InfoLine
          className={'IdentityDigestCard__InfoLine'}
          title={'Funding Address'}
          value={(
            <a {...(l1explorerBaseUrl && {
              href: `${l1explorerBaseUrl}/address/${identity.data.fundingAddress}`,
              target: '_blank',
              rel: 'noopener noreferrer'
            })}>
              <ValueContainer className={'IdentityDigestCard__ValueContainer'} clickable={!!l1explorerBaseUrl} external={!!l1explorerBaseUrl}>
                <Identifier styles={['highlight-both']} ellipsis={false}>
                  {identity.data.fundingAddress || null}
                </Identifier>
              </ValueContainer>
            </a>
          )}
          loading={identity.loading}
          // error={}
        />
        <InfoLine
          className={'IdentityDigestCard__InfoLine'}
          title={'Last Withdrawal'}
          value={(
            <Link href={`/transaction/${identity.data?.lastWithdrawal}`}>
              <ValueContainer className={'IdentityDigestCard__ValueContainer'} clickable={true}>
                {identity.data?.lastWithdrawalTime &&
                  <DateBlock timestamp={identity.data.lastWithdrawalTime} format={'deltaOnly'}/>
                }
                <Identifier ellipsis={false} styles={['highlight-both']}>
                  {identity.data?.lastWithdrawal}
                </Identifier>
              </ValueContainer>
            </Link>
          )}
          loading={identity.loading}
          error={identity.error}
        />
        <InfoLine
          className={'IdentityDigestCard__InfoLine'}
          title={'Total Gas Spent'}
          value={<CreditsBlock credits={100} rate={rate}/>}
          loading={identity.loading}
          // error={}
        />
        <InfoLine
          className={'IdentityDigestCard__InfoLine'}
          title={'Average Gas Spent'}
          value={<CreditsBlock credits={100} rate={rate}/>}
          loading={identity.loading}
          // error={}
        />
      </div>
    </div>
  )
}

export default IdentityDigestCard
