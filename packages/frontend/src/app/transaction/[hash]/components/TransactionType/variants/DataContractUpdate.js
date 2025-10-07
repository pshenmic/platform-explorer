import { InternalConfigCard } from '@components/dataContracts'
import { InfoLine, Identifier, CodeBlock } from '@components/data'
import { ValueCard } from '@components/cards'

/**
 * Displays details for a Data Contract Update transition.
 *
 * @param {Object} props
 * @param {string} [props.dataContractId] - Updated data contract identifier.
 * @param {string} [props.ownerId] - Identity identifier of the contract owner.
 * @param {number} [props.version] - New contract version.
 * @param {number} [props.identityContractNonce] - Identity contract nonce related to the update.
 * @param {Object} [props.schema] - Updated contract JSON schema.
 * @param {Object} [props.internalConfig] - Platform internal config associated with the contract.
 * @param {boolean} [props.loading] - Loading state flag.
 * @returns {JSX.Element}
 */
export const DataContractUpdate = ({ dataContractId, ownerId, version, identityContractNonce, schema, internalConfig, loading }) => (
<>
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Data Contract'}
        value={(
          <ValueCard link={`/dataContract/${dataContractId}`}>
            <Identifier copyButton={true} ellipsis={true} styles={['highlight-both']}>
              {dataContractId}
            </Identifier>
          </ValueCard>
        )}
        loading={loading}
        error={!dataContractId}
      />

      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Contract Owner'}
        value={(
          <ValueCard link={`/identity/${ownerId}`}>
            <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
              {ownerId}
            </Identifier>
          </ValueCard>
        )}
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
        value={<CodeBlock code={JSON.stringify(schema)}/>}
        loading={loading}
        error={schema === undefined}
      />

      {internalConfig &&
        <InfoLine
          className={'TransactionPage__InfoLine TransactionPage__InfoLine--InternalConfig TransactionPage__InfoLine--Baseline'}
          title={'Internal Config'}
          value={<InternalConfigCard config={internalConfig}/>}
          loading={loading}
          error={schema === undefined}
        />
      }

    </>
)
