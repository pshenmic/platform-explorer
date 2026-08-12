import { ValueContainer } from '@ui/containers'
import { InfoLine, Identifier, CreditsBlock } from '@components/data'
import { ValueCard } from '@components/cards'
import { PayoutAddress } from '../../PayoutAddress'
import type { WithLoading, WithRate } from '../../types'

const poolingColors: Record<string, 'green' | 'red' | 'orange'> = {
  Standard: 'green',
  Never: 'red',
  'If Available': 'orange'
}

interface IdentityCreditWithdrawalProps extends WithLoading, WithRate {
  amount?: number | string | null
  senderId?: string | null
  identityNonce?: number | string | null
  signaturePublicKeyId?: number | string | null
  pooling?: string | number | null
  outputScript?: string | null
  proTxHash?: string | null
}

export const IdentityCreditWithdrawal = ({
  amount,
  senderId,
  rate,
  identityNonce,
  signaturePublicKeyId,
  pooling,
  outputScript,
  loading
}: IdentityCreditWithdrawalProps) => (
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
      value={
        <ValueContainer
          colorScheme={pooling != null ? poolingColors[String(pooling)] : undefined}
          size={'sm'}
        >
          {pooling}
        </ValueContainer>
      }
      loading={loading}
      error={pooling === undefined}
    />

    <PayoutAddress identity={senderId} outputScript={outputScript} loading={loading} />
  </>
)
