import { ValueCard } from '@components/cards'
import { InfoLine, Identifier, CodeBlock } from '@components/data'
import { InternalConfigCard } from '@components/dataContracts'
import { TokenConfiguration } from '../TokenConfiguration'

/**
 * Displays details for a Data Contract Create transition.
 *
 * @param {Object} props
 * @param {string} [props.dataContractId] - Created data contract identifier.
 * @param {string} [props.ownerId] - Identity identifier of the contract owner.
 * @param {number} [props.version] - Contract version.
 * @param {number} [props.identityNonce] - Owner identity nonce used for the transition.
 * @param {number} [props.signaturePublicKeyId] - Public key id used to sign the transition.
 * @param {Object} [props.internalConfig] - Platform internal config associated with the contract.
 * @param {Object} [props.schema] - Contract JSON schema.
 * @returns {JSX.Element}
 */
export const DataContractCreate = ({ dataContractId, ownerId, version, identityNonce, signaturePublicKeyId, internalConfig, schema, tokens }) => (
    <>
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Data Contract'}
        value={(
          <ValueCard link={`/dataContract/${dataContractId}`}>
            <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
              {dataContractId}
            </Identifier>
          </ValueCard>
        )}
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
        value={<CodeBlock code={JSON.stringify(schema)}/>}
        error={schema === undefined}
      />

      {internalConfig &&
        <InfoLine
          className={'TransactionPage__InfoLine TransactionPage__InfoLine--InternalConfig TransactionPage__InfoLine--Baseline'}
          title={'Internal Config'}
          value={<InternalConfigCard config={internalConfig}/>}
          error={schema === undefined}
        />
      }
      {tokens?.length && tokens.map((token, i) => (
              <InfoLine
                key={i}
                className={'TransactionPage__InfoLine TransactionPage__InfoLine--InternalConfig TransactionPage__InfoLine--Baseline'}
                title={'Internal Config'}
                value={<TokenConfiguration {...token} />}
              />
      ))}
    </>
)
