import { InfoLine, Identifier } from '@components/data'
import { PublicKeyCard } from '@components/transactions'
import { AssetLockProof } from '../AssetLockProof'
import { ValueCard } from '@components/cards'

/**
 * Displays details for an Identity Create transition.
 *
 * @param {Object} props
 * @param {string} [props.identityId] - Created identity identifier.
 * @param {Object} [props.assetLockProof] - Asset lock proof data.
 * @param {number} [props.rate] - Fiat/DASH conversion rate used by nested components.
 * @param {Array<Object>} [props.publicKeys] - Public keys bound to the identity.
 * @param {boolean} [props.loading] - Loading state flag.
 * @returns {JSX.Element}
 */
export const IdentityCreate = ({
  identityId,
  assetLockProof,
  rate,
  publicKeys,
  loading
}) => (
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
