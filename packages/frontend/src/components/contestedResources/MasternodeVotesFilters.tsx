import type { ComponentType, ReactNode } from 'react'
import { Filters } from '../filters'
import type { FilterState, FiltersConfig } from '../filters/types'
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

const filtersConfig: FiltersConfig = {
  voter_identity: {
    label: 'Voter Identity',
    title: 'Filter by Voter',
    type: 'search',
    entityType: 'identities',
    placeholder: 'Voter Identity',
    defaultValue: '',
    formatValue: value => (typeof value === 'string' ? value : null) || null,
    mobileTagRenderer: value => (
      <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>
        {value as ReactNode}
      </Identifier>
    )
  },
  towards_identity: {
    label: 'Towards Identity',
    title: 'Filter by Towards Identity',
    type: 'search',
    entityType: 'identities',
    placeholder: 'Towards Identity',
    defaultValue: '',
    formatValue: value => (typeof value === 'string' ? value : null) || null,
    mobileTagRenderer: value => (
      <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>
        {value as ReactNode}
      </Identifier>
    )
  },
  timestamp: {
    label: 'Date',
    title: 'Date range',
    type: 'daterange',
    defaultValue: null,
    formatValue: value => {
      const range = value as { start?: Date | null; end?: Date | null } | null
      return `${range?.start ? `from ${range?.start?.toLocaleDateString()}` : ''} ${range?.end ? `to ${range?.end?.toLocaleDateString()}` : ''}`
    }
  }
}

interface MasternodeVotesFiltersProps extends WithClassName {
  initialFilters?: FilterState
  onFilterChange?: (values: Record<string, unknown>) => void
  isMobile?: boolean
}

export default function MasternodeVotesFilters({
  initialFilters,
  onFilterChange,
  isMobile,
  className
}: MasternodeVotesFiltersProps) {
  return (
    <Filters
      filtersConfig={filtersConfig}
      initialFilters={initialFilters}
      onFilterChange={onFilterChange}
      isMobile={isMobile}
      className={`BlocksFilter ${className || ''}`}
      buttonText={'Add filter'}
      applyOnChange={false}
    />
  )
}
