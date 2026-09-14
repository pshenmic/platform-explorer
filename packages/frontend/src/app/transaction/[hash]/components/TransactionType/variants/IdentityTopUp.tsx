import { InfoLine, Identifier, CreditsBlock } from '@components/data'
import { AssetLockProof } from '../AssetLockProof'
import { ValueCard } from '@components/cards'
import type { AssetLockProofData, WithLoading, WithRate } from '../../types'

interface IdentityTopUpProps extends WithLoading, WithRate {
  amount?: number | string | null
  identityId?: string | null
  assetLockProof?: AssetLockProofData | null
}

export const IdentityTopUp = ({
  amount,
  rate,
  identityId,
  assetLockProof,
  loading
}: IdentityTopUpProps) => (
  <>
    <InfoLine
      className={'TransactionPage__InfoLine'}
      title={'Amount'}
      value={<CreditsBlock credits={amount} rate={rate} />}
      loading={loading}
      error={amount === undefined}
    />

    <InfoLine
      className={'TransactionPage__InfoLine'}
      title={'Identity'}
      value={
        <ValueCard link={`/identity/${identityId}`}>
          <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
            {identityId}
          </Identifier>
        </ValueCard>
      }
      loading={loading}
      error={!identityId}
    />

    {assetLockProof && (
      <AssetLockProof assetLockProof={assetLockProof} rate={rate} loading={loading} />
    )}
  </>
)
