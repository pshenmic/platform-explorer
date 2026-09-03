import { ValueCard } from '@components/cards'
import { InfoLine, Identifier, VoteChoice } from '@components/data'
import { VoteIndexValues } from '@components/transactions'
import type { WithLoading } from '../../types'

interface MasterNodeVoteProps extends WithLoading {
  proTxHash?: string | null
  contractId?: string | null
  ownerId?: string | null
  identityNonce?: number | string | null
  choice?: string | null
  documentTypeName?: string | null
  indexName?: string | null
  indexValues?: string[] | null
}

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
}: MasterNodeVoteProps) => (
  <>
    <InfoLine
      className={'TransactionPage__InfoLine'}
      title={'Pro TX Hash'}
      value={
        <ValueCard>
          <Identifier copyButton={true} ellipsis={true} styles={['highlight-both']}>
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
          <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
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
        <ValueCard link={`/identity/${ownerId}`} className={'TransactionPage__BlockHash'}>
          <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
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
      value={<ValueCard className={'TransactionPage__DocumentType'}>{documentTypeName}</ValueCard>}
      loading={loading}
      error={!documentTypeName}
    />

    <InfoLine
      className={'TransactionPage__InfoLine'}
      title={'Index Name'}
      value={<ValueCard className={'TransactionPage__IndexName'}>{indexName}</ValueCard>}
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
