import { ValueCard } from '@components/cards'
import { InfoLine, Identifier, CreditsBlock } from '@components/data'
import { PayoutAddress } from '../../PayoutAddress'

/**
 * Displays details for an Identity Credit Transfer To Address transition.
 *
 * @param {Object} props
 * @param {string} [props.senderId] - Sender identity identifier.
 * @param {number|string} [props.amount] - Credits amount transferred.
 * @param {number} [props.rate] - Fiat/DASH conversion rate used by nested components.
 * @param {number} [props.identityNonce] - Sender identity nonce for the transition.
 * @param {number} [props.signaturePublicKeyId] - Public key id used to sign the transition.
 * @param {number} [props.userFeeIncrease] - User fee increase amount.
 * @param {string} [props.outputAddress] - Core chain recipient address.
 * @param {string} [props.outputScript] - Core output script.
 * @param {boolean} [props.loading] - Loading state flag.
 * @returns {JSX.Element}
 */
export const IdentityCreditTransferToAddress = ({
  senderId,
  amount,
  rate,
  identityNonce,
  signaturePublicKeyId,
  userFeeIncrease,
  outputAddress,
  outputScript,
  loading
}) => (
  <>
    <InfoLine
      className={'TransactionPage__InfoLine'}
      title={'Sender'}
      value={
        <ValueCard link={`/identity/${senderId}`}>
          <Identifier
            avatar={true}
            copyButton={true}
            ellipsis={true}
            styles={['highlight-both']}
          >
            {senderId}
          </Identifier>
        </ValueCard>
      }
      loading={loading}
      error={!senderId}
    />

    <InfoLine
      className={'TransactionPage__InfoLine'}
      title={'Amount'}
      value={<CreditsBlock credits={amount} rate={rate} />}
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
      className={'TransactionPage__InfoLine TransactionPage__InfoLine--Inline'}
      title={'User Fee Increase'}
      value={userFeeIncrease}
      error={userFeeIncrease === undefined}
    />

    <PayoutAddress identity={senderId} outputScript={outputScript} loading={loading} />

    {outputAddress && (
      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'}
        title={'Output Address'}
        value={
          <ValueCard>
            <Identifier copyButton ellipsis styles={['highlight-both']}>
              {outputAddress}
            </Identifier>
          </ValueCard>
        }
      />
    )}
  </>
)
