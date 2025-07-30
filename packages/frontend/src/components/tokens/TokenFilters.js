import { Filters } from '../filters'
import { Identifier } from '../data'

const filtersConfig = {
  min_supply: {
    type: 'range',
    label: 'Min supply',
    title: 'Max supply Range',
    defaultValue: { min: '', max: '' },
    minTitle: 'Minimum amount',
    minPlaceholder: 'ex. 0...',
    maxTitle: 'Maximum amount',
    maxPlaceholder: 'ex. 10000000...',
    formatValue: ({ min, max }) => {
      if (min && max) return `${min} - ${max} Tokens`
      if (min) return `Min ${min} Tokens`
      if (max) return `Max ${max} Tokens`
      return null
    }
  },
  max_supply: {
    type: 'range',
    label: 'Max supply',
    title: 'Max supply Range',
    defaultValue: { min: '', max: '' },
    minTitle: 'Minimum amount',
    minPlaceholder: 'ex. 0...',
    maxTitle: 'Maximum amount',
    maxPlaceholder: 'ex. 10000000...',
    formatValue: ({ min, max }) => {
      if (min && max) return `${min} - ${max} Tokens`
      if (min) return `Min ${min} Tokens`
      if (max) return `Max ${max} Tokens`
      return null
    }
  },
  data_contract: {
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
  owner: {
    label: 'Owner',
    title: 'Filter by owner',
    type: 'search',
    entityType: 'identities',
    placeholder: 'OWNER ID OR IDENTITY',
    defaultValue: '',
    formatValue: (value) => value || null,
    mobileTagRenderer: (value) => (
      <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>{value}</Identifier>
    )
  },
  timestamp: {
    label: 'Date',
    title: 'Date range',
    type: 'daterange',
    defaultValue: null,
    formatValue: (value) => {
      return `${value?.start ? `from ${value?.start?.toLocaleDateString()}` : ''} ${value?.end ? `to ${value?.end?.toLocaleDateString()}` : ''}`
    }
  }
}

export default function TokenFilters ({ initialFilters, onFilterChange, isMobile, className }) {
  return (
    <Filters
      filtersConfig={filtersConfig}
      initialFilters={initialFilters}
      onFilterChange={onFilterChange}
      isMobile={isMobile}
      className={`TokenFilters ${className || ''}`}
      buttonText={'Add filter'}
    />
  )
}
