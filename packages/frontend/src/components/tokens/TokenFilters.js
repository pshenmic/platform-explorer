import { Filters } from '../filters'
import { Identifier } from '../data'

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
  position: {
    type: 'range',
    label: 'Position',
    title: 'Token position in data contract',
    defaultValue: { min: '', max: '' },
    minTitle: 'Min position',
    minPlaceholder: 'ex. 0',
    maxTitle: 'Max position',
    maxPlaceholder: 'ex. 100000',
    formatValue: ({ min, max }) => {
      if (min && max) return `${min} - ${max}`
      if (min) return `Min ${min}`
      if (max) return `Max ${max}`
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
  }
}

export default function TokenFilters ({ initialFilters, onFilterChange, isMobile, className }) {
  return (
    <Filters
      filtersConfig={filtersConfig}
      initialFilters={initialFilters}
      onFilterChange={(values) => {
        const payload = {
          owner: values.owner || undefined,
          position_min: values.position_min || undefined,
          position_max: values.position_max || undefined,
          contract_id: values.data_contract || undefined
        }
        onFilterChange && onFilterChange(payload)
      }}
      isMobile={isMobile}
      className={`TokenFilters ${className || ''}`}
      buttonText={'Add filter'}
      applyOnChange={false}
    />
  )
}
