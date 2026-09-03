import { ValueCard } from '@components/cards'
import { InfoLine, Identifier, CreditsBlock } from '@components/data'
import type { WithLoading, WithRate } from '../../types'

interface IdentityCreditTransferProps extends WithLoading, WithRate {
  senderId?: string | null
  amount?: number | string | null
  identityNonce?: number | string | null
  signaturePublicKeyId?: number | string | null
  recipientId?: string | null
}

export const IdentityCreditTransfer = ({
  senderId,
  amount,
  rate,
  identityNonce,
  signaturePublicKeyId,
  recipientId,
  loading
}: IdentityCreditTransferProps) => (
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

    <InfoLine
      className={'TransactionPage__InfoLine'}
      title={'Recipient'}
      value={
        <ValueCard link={`/identity/${recipientId}`}>
          <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
            {recipientId}
          </Identifier>
        </ValueCard>
      }
      loading={loading}
      error={!recipientId}
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
  </>
)
