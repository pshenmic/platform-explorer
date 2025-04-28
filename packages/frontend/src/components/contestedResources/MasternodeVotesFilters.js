import { Filters } from '../filters'
import { Identifier } from '../data'

const filtersConfig = {
  voter_identity: {
    label: 'Voter Identity',
    title: 'Filter by Voter',
    type: 'search',
    entityType: 'identities',
    placeholder: 'Voter Identity',
    defaultValue: '',
    formatValue: (value) => value || null,
    mobileTagRenderer: (value) => (
      <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>{value}</Identifier>
    )
  },
  towards_identity: {
    label: 'Towards Identity',
    title: 'Filter by Towards Identity',
    type: 'search',
    entityType: 'identities',
    placeholder: 'Towards Identity',
    defaultValue: '',
    formatValue: (value) => value || null,
    mobileTagRenderer: (value) => (
      <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>{value}</Identifier>
    )
  }
}

export default function MasternodeVotesFilters ({ initialFilters, onFilterChange, isMobile, className }) {
  return (
    <Filters
      filtersConfig={filtersConfig}
      initialFilters={initialFilters}
      onFilterChange={onFilterChange}
      isMobile={isMobile}
      className={`BlocksFilter ${className || ''}`}
      buttonText={'Add filter'}
    />
  )
}
