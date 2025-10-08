import { ValueCard } from '@components/cards'
import { InfoLine, Identifier } from '@components/data'
import { PublicKeyCard } from '@components/transactions'

/**
 * Displays details for an Identity Update transition.
 *
 * @param {Object} props
 * @param {string} [props.identityId] - Identity identifier being updated.
 * @param {number} [props.revision] - Identity revision after update.
 * @param {number} [props.identityContractNonce] - Identity contract nonce related to the update.
 * @param {Array<Object>} [props.publicKeysToAdd] - Public keys to be added.
 * @param {Array<Object>} [props.publicKeys] - Current public keys (used for counts/titles).
 * @param {Array<number>} [props.setPublicKeyIdsToDisable] - Public key IDs to disable.
 * @param {number} [props.identityNonce] - Identity nonce.
 * @param {boolean} [props.loading] - Loading state flag.
 * @returns {JSX.Element}
 */
export const IdentityUpdate = ({
  identityId,
  revision,
  identityContractNonce,
  publicKeysToAdd,
  publicKeys,
  setPublicKeyIdsToDisable,
  identityNonce,
  loading
}) => (
  <>
    <InfoLine
      className={'TransactionPage__InfoLine'}
      title={'Identity'}
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
        className={
          'TransactionPage__InfoLine TransactionPage__InfoLine--Inline'
        }
        title={'Identity Nonce'}
        value={identityNonce}
        loading={loading}
        error={identityNonce === undefined}
      />
    )}

    {publicKeysToAdd?.length > 0 && (
      <InfoLine
        className={
          'TransactionPage__InfoLine TransactionPage__InfoLine--PublicKeys'
        }
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

    {setPublicKeyIdsToDisable?.length > 0 && (
      <InfoLine
        className={
          'TransactionPage__InfoLine TransactionPage__InfoLine--PublicKeys'
        }
        title={`Disable Public Keys ${setPublicKeyIdsToDisable !== undefined ? `(${setPublicKeyIdsToDisable?.length})` : ''}`}
        value={
          <>
            {setPublicKeyIdsToDisable?.map((publicKey, i) => (
              <PublicKeyCard
                className={'TransactionPage__PublicKeyCard'}
                publicKey={{ id: publicKey }}
                key={i}
              />
            ))}
          </>
        }
        loading={loading}
        error={setPublicKeyIdsToDisable === undefined}
      />
    )}
  </>
)
