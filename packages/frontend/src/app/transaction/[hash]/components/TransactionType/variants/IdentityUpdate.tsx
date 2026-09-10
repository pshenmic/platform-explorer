import { ValueCard } from '@components/cards'
import { InfoLine, Identifier } from '@components/data'
import { PublicKeyCard } from '@components/transactions'
import type { PublicKeyData } from 'src/components/transactions/PublicKeyCard'
import type { WithLoading } from '../../types'

interface IdentityUpdateProps extends WithLoading {
  identityId?: string | null
  revision?: number | string | null
  identityContractNonce?: number | string | null
  publicKeysToAdd?: PublicKeyData[] | null
  publicKeys?: PublicKeyData[] | null
  publicKeyIdsToDisable?: Array<number | string> | null
  identityNonce?: number | string | null
}

export const IdentityUpdate = ({
  identityId,
  revision,
  identityContractNonce,
  publicKeysToAdd,
  publicKeys,
  publicKeyIdsToDisable,
  identityNonce,
  loading
}: IdentityUpdateProps) => (
  <>
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

    <InfoLine
      className={'TransactionPage__InfoLine TransactionPage__InfoLine--Inline'}
      title={'Identity Nonce'}
      value={identityNonce}
      loading={loading}
      error={identityNonce === undefined}
    />

    <InfoLine
      className={'TransactionPage__InfoLine'}
      title={'Revision'}
      value={revision}
      loading={loading}
      error={revision === undefined}
    />

    {identityContractNonce !== undefined && (
      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--Inline'}
        title={'Identity Nonce'}
        value={identityNonce}
        loading={loading}
        error={identityNonce === undefined}
      />
    )}

    {(publicKeysToAdd?.length ?? 0) > 0 && (
      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--PublicKeys'}
        title={`Add Public Keys ${publicKeys !== undefined ? `(${publicKeysToAdd?.length})` : ''}`}
        value={
          <>
            {publicKeysToAdd?.map((publicKey, i) => (
              <PublicKeyCard
                className={'TransactionPage__PublicKeyCard'}
                publicKey={publicKey}
                key={i}
              />
            ))}
          </>
        }
        loading={loading}
        error={publicKeysToAdd === undefined}
      />
    )}

    {(publicKeyIdsToDisable?.length ?? 0) > 0 && (
      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--PublicKeys'}
        title={`Disable Public Keys ${
          publicKeyIdsToDisable !== undefined ? `(${publicKeyIdsToDisable?.length})` : ''
        }`}
        value={
          <>
            {publicKeyIdsToDisable?.map((publicKey, i) => (
              <PublicKeyCard
                className={'TransactionPage__PublicKeyCard'}
                publicKey={{ id: publicKey }}
                key={i}
              />
            ))}
          </>
        }
        loading={loading}
        error={publicKeyIdsToDisable === undefined}
      />
    )}
  </>
)
