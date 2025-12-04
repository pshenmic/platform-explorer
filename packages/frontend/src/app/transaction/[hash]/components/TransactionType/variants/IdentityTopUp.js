import { InfoLine, Identifier, CreditsBlock } from '@components/data'
import { AssetLockProof } from '../AssetLockProof'
import { ValueCard } from '@components/cards'

/**
 * Displays details for an Identity Top Up transition.
 *
 * @param {Object} props
 * @param {number|string} [props.amount] - Credits amount used to top up the identity.
 * @param {number} [props.rate] - Fiat/DASH conversion rate used by nested components.
 * @param {string} [props.identityId] - Identity identifier being topped up.
 * @param {Object} [props.assetLockProof] - Asset lock proof data.
 * @param {boolean} [props.loading] - Loading state flag.
 * @returns {JSX.Element}
 */
export const IdentityTopUp = ({
  amount,
  rate,
  identityId,
  assetLockProof,
  loading
}) => (
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

    {assetLockProof && (
      <AssetLockProof
        assetLockProof={assetLockProof}
        rate={rate}
        loading={loading}
      />
    )}
  </>
)
