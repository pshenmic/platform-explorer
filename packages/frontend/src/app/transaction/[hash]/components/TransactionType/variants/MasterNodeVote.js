import { ValueCard } from '@components/cards'
import { InfoLine, Identifier, VoteChoice } from '@components/data'
import { VoteIndexValues } from '@components/transactions'

/**
 * Displays details for a Masternode Vote transition.
 *
 * @param {Object} props
 * @param {string} [props.proTxHash] - ProTxHash of the voting masternode.
 * @param {string} [props.contractId] - Target data contract identifier.
 * @param {string} [props.ownerId] - Voter identity identifier.
 * @param {number} [props.identityNonce] - Voter identity nonce.
 * @param {string} [props.choice] - Vote choice string.
 * @param {string} [props.documentTypeName] - Target document type.
 * @param {string} [props.indexName] - Target index name.
 * @param {Array<Object>|Object} [props.indexValues] - Values for the targeted index.
 * @param {boolean} [props.loading] - Loading state flag.
 * @returns {JSX.Element}
 */
export const MasterNodeVote = ({
  proTxHash,
  contractId,
  ownerId,
  identityNonce,
  choice,
  documentTypeName,
  indexName,
  indexValues,
  loading
}) => (
  <>
    <InfoLine
      className={'TransactionPage__InfoLine'}
      title={'Pro TX Hash'}
      value={
        <ValueCard>
          <Identifier
            copyButton={true}
            ellipsis={true}
            styles={['highlight-both']}
          >
            {proTxHash}
          </Identifier>
        </ValueCard>
      }
      loading={loading}
      error={!proTxHash}
    />

    <InfoLine
      className={'TransactionPage__InfoLine'}
      title={'Data Contract'}
      value={
        <ValueCard link={`/dataContract/${contractId}`}>
          <Identifier
            avatar={true}
            copyButton={true}
            ellipsis={true}
            styles={['highlight-both']}
          >
            {contractId}
          </Identifier>
        </ValueCard>
      }
      loading={loading}
      error={!contractId}
    />

    <InfoLine
      className={'TransactionPage__InfoLine'}
      title={'Voter Identity'}
      value={
        <ValueCard
          link={`/identity/${ownerId}`}
          className={'TransactionPage__BlockHash'}
        >
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
      className={'TransactionPage__InfoLine TransactionPage__InfoLine--Inline'}
      title={'Identity Nonce'}
      value={identityNonce}
      loading={loading}
      error={identityNonce === undefined}
    />

    <InfoLine
      className={`TransactionPage__InfoLine TransactionPage__InfoLine--VoteChoice ${!choice?.includes('TowardsIdentity') ? 'TransactionPage__InfoLine--Inline' : ''}`}
      title={'Choice'}
      value={<VoteChoice choiceStr={choice} />}
      loading={loading}
      error={!choice}
    />

    <InfoLine
      className={'TransactionPage__InfoLine'}
      title={'Document Type'}
      value={
        <ValueCard className={'TransactionPage__DocumentType'}>
          {documentTypeName}
        </ValueCard>
      }
      loading={loading}
      error={!documentTypeName}
    />

    <InfoLine
      className={'TransactionPage__InfoLine'}
      title={'Index Name'}
      value={
        <ValueCard className={'TransactionPage__IndexName'}>
          {indexName}
        </ValueCard>
      }
      loading={loading}
      error={!indexName}
    />

    {indexValues && (
      <InfoLine
        className={
          'TransactionPage__InfoLine TransactionPage__InfoLine--VoteIndexValues TransactionPage__InfoLine--Baseline'
        }
        title={'Index Values'}
        value={
          <div className={'TransactionPage__VoteIndexValuesContainer'}>
            <VoteIndexValues indexValues={indexValues} />
          </div>
        }
        loading={loading}
        error={!indexValues}
      />
    )}
  </>
)
