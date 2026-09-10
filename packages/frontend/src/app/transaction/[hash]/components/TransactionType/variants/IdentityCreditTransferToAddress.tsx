import { Fragment } from 'react'
import { ValueCard } from '@components/cards'
import { InfoLine, Identifier, CreditsBlock } from '@components/data'
import type { DecodedPlatformAddress, WithLoading, WithRate } from '../../types'

interface RecipientAddress {
  platformAddress?: DecodedPlatformAddress | null
  amount?: number | string | null
}

interface IdentityCreditTransferToAddressProps extends WithLoading, WithRate {
  senderId?: string | null
  nonce?: number | string | null
  userFeeIncrease?: number | null
  recipientAddresses?: RecipientAddress[] | null
}

export const IdentityCreditTransferToAddress = ({
  senderId,
  nonce,
  userFeeIncrease,
  recipientAddresses,
  rate,
  loading
}: IdentityCreditTransferToAddressProps) => (
  <>
    <InfoLine
      className={'TransactionPage__InfoLine'}
      title={'Sender'}
      value={
        <ValueCard link={`/identity/${senderId}`}>
          <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
            {senderId}
          </Identifier>
        </ValueCard>
      }
      loading={loading}
      error={!senderId}
    />

    {(recipientAddresses || []).map((recipient, i) => {
      const label = (recipientAddresses?.length ?? 0) > 1 ? `Recipient ${i + 1}` : 'Recipient'
      return (
        <Fragment key={i}>
          <InfoLine
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
            className={'TransactionPage__InfoLine'}
            title={'Amount'}
            value={<CreditsBlock credits={recipient.amount} rate={rate} />}
            loading={loading}
            error={recipient.amount === undefined}
          />
        </Fragment>
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
