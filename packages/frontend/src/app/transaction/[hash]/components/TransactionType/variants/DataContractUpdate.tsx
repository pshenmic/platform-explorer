import { InternalConfigCard } from '@components/dataContracts'
import { InfoLine, Identifier, JsonViewer } from '@components/data'
import { ValueCard } from '@components/cards'
import type { WithLoading } from '../../types'

interface DataContractUpdateProps extends WithLoading {
  dataContractId?: string | null
  ownerId?: string | null
  version?: number | string | null
  identityContractNonce?: number | string | null
  schema?: unknown
  internalConfig?: Record<string, unknown> | null
}

export const DataContractUpdate = ({
  dataContractId,
  ownerId,
  version,
  identityContractNonce,
  schema,
  internalConfig,
  loading
}: DataContractUpdateProps) => (
  <>
    <InfoLine
      className={'TransactionPage__InfoLine'}
      title={'Data Contract'}
      value={
        <ValueCard link={`/dataContract/${dataContractId}`}>
          <Identifier
            copyButton={true}
            ellipsis={true}
            styles={['highlight-both']}
          >
            {dataContractId}
          </Identifier>
        </ValueCard>
      }
      loading={loading}
      error={!dataContractId}
    />

    <InfoLine
      className={'TransactionPage__InfoLine'}
      title={'Contract Owner'}
      value={
        <ValueCard link={`/identity/${ownerId}`}>
          <Identifier
            avatar={true}
            copyButton={true}
            ellipsis={true}
            styles={['highlight-both']}
          >
            {ownerId}
          </Identifier>
        </ValueCard>
      }
      loading={loading}
      error={!ownerId}
    />

    <InfoLine
      className={'TransactionPage__InfoLine'}
      title={'Version'}
      value={version}
      loading={loading}
      error={version === undefined}
    />

    <InfoLine
      className={'TransactionPage__InfoLine TransactionPage__InfoLine--Inline'}
      title={'Identity Contract Nonce'}
      value={identityContractNonce}
      loading={loading}
      error={identityContractNonce === undefined}
    />

    <InfoLine
      className={'TransactionPage__InfoLine TransactionPage__InfoLine--Schema'}
      title={'Schema'}
      value={<JsonViewer value={schema} />}
      loading={loading}
      error={schema === undefined}
    />

    {internalConfig && (
      <InfoLine
        className={
          'TransactionPage__InfoLine TransactionPage__InfoLine--InternalConfig TransactionPage__InfoLine--Baseline'
        }
        title={'Internal Config'}
        value={<InternalConfigCard config={internalConfig} />}
        loading={loading}
        error={schema === undefined}
      />
    )}
  </>
)
