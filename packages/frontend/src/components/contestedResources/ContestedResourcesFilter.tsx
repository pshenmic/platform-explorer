import type { ReactNode } from 'react'
import type { ComponentType } from 'react'
import { Filters } from '../filters'
import type { FilterState, FilterStateValue, FiltersConfig } from '../filters/types'
import { Identifier as IdentifierJs } from '../data'
import type { WithClassName } from '../../types'

// Untyped JS component — loose wrapper until data/Identifier is migrated
const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  avatar?: boolean
  ellipsis?: boolean
  styles?: string[]
  className?: string
}>

const VotingStateEnum = {
  PENDING: 'pending',
  FINISHED: 'finished'
} as const

type VotingState = (typeof VotingStateEnum)[keyof typeof VotingStateEnum]

const votingStateOptions = [
  { label: 'Pending', title: 'Voting in progress', value: VotingStateEnum.PENDING },
  { label: 'Finished', title: 'Voting finished', value: VotingStateEnum.FINISHED }
]

const pickVotingState = (values?: FilterStateValue): string | undefined => {
  if (!Array.isArray(values) || values.length === 0 || values.length === votingStateOptions.length) {
    return undefined
  }
  return values[0] as string
}

const toIsVotingFinished = (votingState?: string): boolean | undefined => {
  if (votingState === VotingStateEnum.FINISHED) return true
  if (votingState === VotingStateEnum.PENDING) return false
  return undefined
}

const filtersConfig: FiltersConfig = {
  voting_state: {
    type: 'multiselect',
    label: 'Status',
    title: 'Filter by voting status',
    options: votingStateOptions,
    defaultValue: [VotingStateEnum.PENDING, VotingStateEnum.FINISHED] as VotingState[],
    formatValue: (values) => pickVotingState(values) || undefined,
    isAllSelected: (values) => Array.isArray(values) && values.length === votingStateOptions.length
  },
  document_type_name: {
    label: 'Document type',
    title: 'Filter by document type',
    type: 'input',
    placeholder: 'e.g. domain',
    defaultValue: '',
    formatValue: (value) => (typeof value === 'string' ? value : null) || null
  },
  contract_id: {
    label: 'Data Contract',
    title: 'Filter by Data Contract',
    type: 'search',
    entityType: 'dataContracts',
    placeholder: 'Data Contract name or identifier',
    defaultValue: '',
    formatValue: (value) => (typeof value === 'string' ? value : null) || null,
    mobileTagRenderer: (value) => (
      <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>{value as ReactNode}</Identifier>
    )
  },
  timestamp: {
    label: 'Created date',
    title: 'Creation date range',
    type: 'daterange',
    defaultValue: null,
    formatValue: (value) => {
      const range = value as { start?: Date | null, end?: Date | null } | null
      return `${range?.start ? `from ${range?.start?.toLocaleDateString()}` : ''} ${range?.end ? `to ${range?.end?.toLocaleDateString()}` : ''}`
    }
  }
}

export interface ContestedResourcesFilterPayload {
  is_voting_finished?: boolean
  document_type_name?: string
  contract_id?: string
  timestamp_start?: string
  timestamp_end?: string
}

interface ContestedResourcesFilterProps extends WithClassName {
  initialFilters?: FilterState
  onFilterChange?: (payload: ContestedResourcesFilterPayload) => void
  isMobile?: boolean
}

export const ContestedResourcesFilter = ({
  initialFilters,
  onFilterChange,
  isMobile,
  className
}: ContestedResourcesFilterProps) => {
  return (
    <Filters
      filtersConfig={filtersConfig}
      initialFilters={initialFilters}
      onFilterChange={(values) => {
        const payload: ContestedResourcesFilterPayload = {
          is_voting_finished: toIsVotingFinished(pickVotingState(values.voting_state as FilterStateValue)),
          document_type_name: (values.document_type_name as string) || undefined,
          contract_id: (values.contract_id as string) || undefined,
          timestamp_start: values.timestamp_start
            ? new Date(values.timestamp_start as string | Date).toISOString()
            : undefined,
          timestamp_end: values.timestamp_end
            ? new Date(values.timestamp_end as string | Date).toISOString()
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
