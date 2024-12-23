import { CreditsBlock, DateBlock, Identifier, InfoLine } from '../data'
import Link from 'next/link'
import { ValueContainer } from '../ui/containers'
import { LoadingLine } from '../loading'
import { networks } from '../../constants/networks'
import './IdentityDigestCard.scss'

function IdentityDigestCard ({ identity, rate, className }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const activeNetwork = networks.find(network => network.explorerBaseUrl === baseUrl)
  const l1explorerBaseUrl = activeNetwork?.l1explorerBaseUrl || null

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
