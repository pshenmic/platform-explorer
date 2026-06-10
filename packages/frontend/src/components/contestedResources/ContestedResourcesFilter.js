import { Filters } from '../filters'
import { Identifier } from '../data'

const VotingStateEnum = {
  PENDING: 'pending',
  FINISHED: 'finished'
}

const votingStateOptions = [
  { label: 'Pending', title: 'Voting in progress', value: VotingStateEnum.PENDING },
  { label: 'Finished', title: 'Voting finished', value: VotingStateEnum.FINISHED }
]

const pickVotingState = (values) => {
  if (!Array.isArray(values) || values.length === 0 || values.length === votingStateOptions.length) {
    return undefined
  }
  return values[0]
}

const toIsVotingFinished = (votingState) => {
  if (votingState === VotingStateEnum.FINISHED) return true
  if (votingState === VotingStateEnum.PENDING) return false
  return undefined
}

const filtersConfig = {
  voting_state: {
    type: 'multiselect',
    label: 'Status',
    title: 'Filter by voting status',
    options: votingStateOptions,
    defaultValue: [VotingStateEnum.PENDING, VotingStateEnum.FINISHED],
    formatValue: (values) => pickVotingState(values) || undefined,
    isAllSelected: (values) => values.length === votingStateOptions.length
  },
  document_type_name: {
    label: 'Document type',
    title: 'Filter by document type',
    type: 'input',
    placeholder: 'e.g. domain',
    defaultValue: '',
    formatValue: (value) => value || null
  },
  contract_id: {
    label: 'Data Contract',
    title: 'Filter by Data Contract',
    type: 'search',
    entityType: 'dataContracts',
    placeholder: 'Data Contract name or identifier',
    defaultValue: '',
    formatValue: (value) => value || null,
    mobileTagRenderer: (value) => (
      <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>{value}</Identifier>
    )
  },
  timestamp: {
    label: 'Created date',
    title: 'Creation date range',
    type: 'daterange',
    defaultValue: null,
    formatValue: (value) => {
      return `${value?.start ? `from ${value?.start?.toLocaleDateString()}` : ''} ${value?.end ? `to ${value?.end?.toLocaleDateString()}` : ''}`
    }
  }
}

export const ContestedResourcesFilter = ({ initialFilters, onFilterChange, isMobile, className }) => {
  return (
    <Filters
      filtersConfig={filtersConfig}
      initialFilters={initialFilters}
      onFilterChange={(values) => {
        const payload = {
          is_voting_finished: toIsVotingFinished(pickVotingState(values.voting_state)),
          document_type_name: values.document_type_name || undefined,
          contract_id: values.contract_id || undefined,
          timestamp_start: values.timestamp_start
            ? new Date(values.timestamp_start).toISOString()
            : undefined,
          timestamp_end: values.timestamp_end
            ? new Date(values.timestamp_end).toISOString()
            : undefined
        }
        onFilterChange && onFilterChange(payload)
      }}
      isMobile={isMobile}
      className={`ContestedResourcesFilter ${className || ''}`}
      buttonText={'Add filter'}
      applyOnChange={false}
    />
  )
}

export default ContestedResourcesFilter
