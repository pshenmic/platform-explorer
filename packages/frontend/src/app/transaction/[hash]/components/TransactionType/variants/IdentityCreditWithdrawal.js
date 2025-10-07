import { ValueContainer } from '@ui/containers'
import { InfoLine, Identifier, CreditsBlock } from '@components/data'
import { ValueCard } from '@components/cards'

const poolingColors = {
  Standard: 'green',
  Never: 'red',
  'If Available': 'orange'
}

/**
 * Displays details for an Identity Credit Withdrawal transition.
 *
 * @param {Object} props
 * @param {number|string} [props.amount] - Credits amount to withdraw.
 * @param {string} [props.senderId] - Identity performing the withdrawal.
 * @param {number} [props.rate] - Fiat/DASH conversion rate used by nested components.
 * @param {number} [props.identityNonce] - Identity nonce for the transition.
 * @param {number} [props.signaturePublicKeyId] - Public key id used to sign the transition.
 * @param {'Standard'|'Never'|'If Available'} [props.pooling] - Pooling preference.
 * @param {string} [props.outputScript] - Core output script for the payout.
 * @param {boolean} [props.loading] - Loading state flag.
 * @returns {JSX.Element}
 */
export const IdentityCreditWithdrawal = ({ amount, senderId, rate, identityNonce, signaturePublicKeyId, pooling, outputScript, loading }) => (
    <>
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Amount'}
        value={<CreditsBlock credits={amount} rate={rate}/>}
        loading={loading}
        error={amount === undefined}
      />

      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Identity'}
        value={(
          <ValueCard link={`/identity/${senderId}`}>
            <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
              {senderId}
            </Identifier>
          </ValueCard>
        )}
        loading={loading}
        error={amount === undefined}
      />

      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--Inline'}
        title={'Identity Nonce'}
        value={identityNonce}
        loading={loading}
        error={identityNonce === undefined}
      />

      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--Inline'}
        title={'Signature Public Key Id'}
        value={signaturePublicKeyId}
        loading={loading}
        error={signaturePublicKeyId === undefined}
      />

      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--Pooling'}
        title={'Pooling'}
        value={(
          <ValueContainer colorScheme={poolingColors?.[pooling]} size={'sm'}>
            {pooling}
          </ValueContainer>
        )}
        loading={loading}
        error={pooling === undefined}
      />

      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--OutputScript'}
        title={'Output Script'}
        value={(
          <ValueCard className={'TransactionPage__OutputScript'}>
            <Identifier copyButton={true} ellipsis={false}>
              {outputScript}
            </Identifier>
          </ValueCard>
        )}
        loading={loading}
        error={outputScript === undefined}
      />
    </>
)
