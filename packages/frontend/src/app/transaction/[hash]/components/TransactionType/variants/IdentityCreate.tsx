import { InfoLine, Identifier } from '@components/data'
import { PublicKeyCard } from '@components/transactions'
import type { PublicKeyData } from 'src/components/transactions/PublicKeyCard'
import { AssetLockProof } from '../AssetLockProof'
import { ValueCard } from '@components/cards'
import type { AssetLockProofData, WithLoading, WithRate } from '../../types'

interface IdentityCreateProps extends WithLoading, WithRate {
  identityId?: string | null
  assetLockProof?: AssetLockProofData | null
  publicKeys?: PublicKeyData[] | null
}

export const IdentityCreate = ({
  identityId,
  assetLockProof,
  rate,
  publicKeys,
  loading
}: IdentityCreateProps) => (
  <>
    <InfoLine
      className={'TransactionPage__InfoLine'}
      title={'Identity Address'}
      value={
        <ValueCard link={`/identity/${identityId}`}>
          <Identifier
            avatar={true}
            copyButton={true}
            ellipsis={true}
            styles={['highlight-both']}
          >
            {identityId}
          </Identifier>
        </ValueCard>
      }
      loading={loading}
      error={!identityId}
    />

    <AssetLockProof
      assetLockProof={assetLockProof}
      rate={rate}
      loading={loading}
    />

    <InfoLine
      className={
        'TransactionPage__InfoLine TransactionPage__InfoLine--PublicKeys'
      }
      title={`Public Keys ${publicKeys !== undefined ? `(${publicKeys?.length})` : ''}`}
      value={
        <>
          {publicKeys?.map((publicKey, i) => (
            <PublicKeyCard
              className={'TransactionPage__PublicKeyCard'}
              publicKey={publicKey}
              key={i}
            />
          ))}
        </>
      }
      loading={loading}
      error={publicKeys === undefined}
    />
  </>
)
