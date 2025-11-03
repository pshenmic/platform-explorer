import Identifier from '@components/data/Identifier'
import { Filters } from '@components/filters'

const withTokensOptions = [
  { label: 'With tokens', title: 'Data contracts with tokens', value: true }
]

const isSystemOptions = [
  { label: 'System', title: 'System contracts', value: true }
]

const filtersConfig = {
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
  is_system: {
    type: 'multiselect',
    label: 'System',
    title: 'System',
    options: isSystemOptions,
    defaultValue: [],
    maxSelected: 1,
    formatValue: ([value] = []) => (value ? String(value) : null),
    isAllSelected: () => false
  },
  with_tokens: {
    type: 'multiselect',
    label: 'With tokens',
    title: 'With tokens',
    options: withTokensOptions,
    defaultValue: [],
    maxSelected: 1,
    formatValue: ([value] = []) => (value != null ? String(value) : null),
    isAllSelected: () => false
  },
  documents_count: {
    type: 'range',
    label: 'Documents',
    title: 'Documents count',
    defaultValue: { min: '', max: '' },
    minTitle: 'Minimum count',
    minPlaceholder: 'ex. 0',
    maxTitle: 'Maximum count',
    maxPlaceholder: 'ex. 100',
    formatValue: ({ min, max }) => {
      if (min && max) return `${min} - ${max}`
      if (min) return `Min ${min}`
      if (max) return `Max ${max}`
      return null
    }
  },
  timestamp: {
    label: 'Date',
    title: 'Date range',
    type: 'daterange',
    defaultValue: null,
    formatValue: (value) => `${value?.start ? `from ${value?.start?.toLocaleDateString()}` : ''} ${value?.end ? `to ${value?.end?.toLocaleDateString()}` : ''}`
  }
}

export const DataContractsFilter = ({ onFilterChange, isMobile, className }) => {
  return (
    <Filters
      filtersConfig={filtersConfig}
      onFilterChange={(values) => {
        const [isSystemSelected] = values.is_system ?? []
        const [withTokensSelected] = values.with_tokens ?? []
        const payload = {
          owner: values.owner || undefined,
          is_system: isSystemSelected ? 'true' : undefined,
          with_tokens: withTokensSelected != null ? String(withTokensSelected) : undefined,
          documents_count_min: values.documents_count?.min || undefined,
          documents_count_max: values.documents_count?.max || undefined,
          timestamp_start: values.timestamp_start ? new Date(values.timestamp_start).toISOString() : undefined,
          timestamp_end: values.timestamp_end ? new Date(values.timestamp_end).toISOString() : undefined
        }
        onFilterChange && onFilterChange(payload)
      }}
      isMobile={isMobile}
      className={`DataContractsFilter ${className || ''}`}
      buttonText={'Add filter'}
      applyOnChange={false}
    />
  )
}
