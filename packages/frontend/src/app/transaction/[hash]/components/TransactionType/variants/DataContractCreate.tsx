import { ValueCard } from '@components/cards'
import { InfoLine, Identifier, JsonViewer } from '@components/data'
import { InternalConfigCard } from '@components/dataContracts'
import { TokenConfiguration } from '../TokenConfiguration'
import type { TokenConfigurationData } from '../../types'

interface DataContractCreateProps {
  dataContractId?: string | null
  ownerId?: string | null
  version?: number | string | null
  identityNonce?: number | string | null
  signaturePublicKeyId?: number | string | null
  internalConfig?: Record<string, unknown> | null
  schema?: unknown
  tokens?: TokenConfigurationData[] | null
}

export const DataContractCreate = ({
  dataContractId,
  ownerId,
  version,
  identityNonce,
  signaturePublicKeyId,
  internalConfig,
  schema,
  tokens
}: DataContractCreateProps) => (
  <>
    <InfoLine
      className={'TransactionPage__InfoLine'}
      title={'Data Contract'}
      value={
        <ValueCard link={`/dataContract/${dataContractId}`}>
          <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
            {dataContractId}
          </Identifier>
        </ValueCard>
      }
      error={!dataContractId}
    />

    <InfoLine
      className={'TransactionPage__InfoLine'}
      title={'Contract Owner'}
      value={
        <ValueCard link={`/identity/${ownerId}`}>
          <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
            {ownerId}
          </Identifier>
        </ValueCard>
      }
      error={!ownerId}
    />

    <InfoLine
      className={'TransactionPage__InfoLine TransactionPage__InfoLine--Inline'}
      title={'Version'}
      value={version}
      error={version === undefined}
    />

    <InfoLine
      className={'TransactionPage__InfoLine TransactionPage__InfoLine--Inline'}
      title={'Identity Nonce'}
      value={identityNonce}
      error={identityNonce === undefined}
    />

    <InfoLine
      className={'TransactionPage__InfoLine TransactionPage__InfoLine--Inline'}
      title={'Signature Public Key Id'}
      value={signaturePublicKeyId}
      error={signaturePublicKeyId === undefined}
    />

    <InfoLine
      className={'TransactionPage__InfoLine TransactionPage__InfoLine--Schema'}
      title={'Schema'}
      value={<JsonViewer value={schema} />}
      error={schema === undefined}
    />

    {internalConfig && (
      <InfoLine
        className={
          'TransactionPage__InfoLine TransactionPage__InfoLine--InternalConfig TransactionPage__InfoLine--Baseline'
        }
        title={'Internal Config'}
        value={<InternalConfigCard config={internalConfig} />}
        error={schema === undefined}
      />
    )}
    {!!tokens?.length &&
      tokens.map((token, i) => (
        <InfoLine
          key={i}
          className={
            'TransactionPage__InfoLine TransactionPage__InfoLine--InternalConfig TransactionPage__InfoLine--Baseline'
          }
          title={'Internal Config'}
          value={<TokenConfiguration {...token} />}
        />
      ))}
  </>
)
