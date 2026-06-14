import { ValueCard } from '@components/cards'
import { InfoLine, Identifier, CreditsBlock } from '@components/data'

/**
 * Displays details for an Identity Credit Transfer To Address transition.
 *
 * @param {Object} props
 * @param {string} [props.senderId] - Sender identity identifier.
 * @param {string} [props.nonce] - Sender identity nonce for the transition.
 * @param {number} [props.userFeeIncrease] - User fee increase amount.
 * @param {Array<{platformAddress: {bech32m: string}, amount: string}>} [props.recipientAddresses] - List of recipient addresses with amounts.
 * @param {Object} [props.rate] - Fiat/DASH conversion rate used by nested components.
 * @param {boolean} [props.loading] - Loading state flag.
 * @returns {JSX.Element}
 */
export const IdentityCreditTransferToAddress = ({
  senderId,
  nonce,
  userFeeIncrease,
  recipientAddresses,
  rate,
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

    {(recipientAddresses || []).map((recipient, i) => {
      const label = recipientAddresses.length > 1 ? `Recipient ${i + 1}` : 'Recipient'
      return (
        <>
          <InfoLine
            key={`addr-${i}`}
            className={'TransactionPage__InfoLine'}
            title={label}
            value={
              <ValueCard link={`/platformAddress/${recipient.platformAddress?.bech32m}`}>
                <Identifier
                  avatar={true}
                  copyButton={true}
                  ellipsis={true}
                  styles={['highlight-both']}
                >
                  {recipient.platformAddress?.bech32m}
                </Identifier>
              </ValueCard>
            }
            loading={loading}
            error={!recipient.platformAddress?.bech32m}
          />
          <InfoLine
            key={`amount-${i}`}
            className={'TransactionPage__InfoLine'}
            title={'Amount'}
            value={<CreditsBlock credits={recipient.amount} rate={rate} />}
            loading={loading}
            error={recipient.amount === undefined}
          />
        </>
      )
    })}

    <InfoLine
      className={'TransactionPage__InfoLine TransactionPage__InfoLine--Inline'}
      title={'Nonce'}
      value={nonce}
      loading={loading}
      error={nonce === undefined}
    />

    <InfoLine
      className={'TransactionPage__InfoLine TransactionPage__InfoLine--Inline'}
      title={'User Fee Increase'}
      value={userFeeIncrease}
      error={userFeeIncrease === undefined}
    />
  </>
)
