import { ValueCard } from '@components/cards'
import { InfoLine, Identifier } from '@components/data'
import { AssetLockProof } from '../AssetLockProof'
import {
  ShieldedActions,
  AmountInfoLine,
  HashInfoLine
} from '../ShieldedCommon'

/**
 * Displays details for an Identity Create From Shielded Pool transaction.
 * Renders only the fields that are present.
 *
 * @param {Object} props
 * @param {string} [props.identityId]
 * @param {Object} [props.assetLockProof]
 * @param {Array} [props.actions]
 * @param {number} [props.amount]
 * @param {number} [props.valueBalance]
 * @param {string} [props.anchor]
 * @param {string} [props.proof]
 * @param {string} [props.bindingsSignature]
 * @param {string} [props.signature]
 * @param {Object} [props.rate]
 * @returns {JSX.Element}
 */
export const IdentityCreateFromShieldedPool = ({
  identityId,
  assetLockProof,
  actions = [],
  amount,
  valueBalance,
  anchor,
  proof,
  bindingsSignature,
  signature,
  rate
}) => (
  <>
    {identityId && (
      <InfoLine
        className='TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'
        title='Identity'
        value={
          <ValueCard link={`/identity/${identityId}`}>
            <Identifier avatar copyButton ellipsis styles={['highlight-both']}>
              {identityId}
            </Identifier>
          </ValueCard>
        }
      />
    )}

    <AmountInfoLine title='Amount' amount={amount} rate={rate} />
    <AmountInfoLine title='Value Balance' amount={valueBalance} rate={rate} />
    {assetLockProof && <AssetLockProof assetLockProof={assetLockProof} />}
    <ShieldedActions actions={actions} />
    <HashInfoLine title='Anchor' value={anchor} />
    <HashInfoLine title='Bindings Signature' value={bindingsSignature} />
    <HashInfoLine title='Signature' value={signature} />
    <HashInfoLine title='Proof' value={proof} />
  </>
)
