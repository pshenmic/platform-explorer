import Identifier from '@components/data/Identifier'
import { Filters } from '@components/filters'

const filtersConfig = {
  document_type_name: {
    label: 'Type',
    title: 'Document type',
    type: 'input',
    placeholder: 'ex. note',
    defaultValue: '',
    formatValue: (value) => value || null
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
      <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>
        {value}
      </Identifier>
    )
  },
  revision: {
    type: 'range',
    label: 'Revision',
    title: 'Revision range',
    defaultValue: { min: '', max: '' },
    minTitle: 'Minimum revision',
    minPlaceholder: 'ex. 0',
    maxTitle: 'Maximum revision',
    maxPlaceholder: 'ex. 5',
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
    formatValue: (value) =>
      `${value?.start ? `from ${value?.start?.toLocaleDateString()}` : ''} ${value?.end ? `to ${value?.end?.toLocaleDateString()}` : ''}`
  }
}

export const DocumentsFilter = ({
  onFilterChange,
  isMobile,
  className
}) => {
  return (
    <Filters
      filtersConfig={filtersConfig}
      onFilterChange={(values) => {
        const payload = {
          document_type_name: values.document_type_name || undefined,
          owner: values.owner || undefined,
          revision_min: values.revision_min || undefined,
          revision_max: values.revision_max || undefined,
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
      className={`DocumentsFilter ${className || ''}`}
      buttonText={'Add filter'}
      applyOnChange={false}
    />
  )
}
