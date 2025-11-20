import Identifier from '@components/data/Identifier'
import { Filters } from '@components/filters'

const ActiveOptionsEnum = {
  CURRENT: 'Current',
  QUEUED: 'Queued'
}

const isActiveOptions = [
  { label: 'Current', title: 'Currently active validators', value: ActiveOptionsEnum.CURRENT },
  { label: 'Queued', title: 'Currently active validators', value: ActiveOptionsEnum.QUEUED }
]

const checkActive = (values) => {
  if (!values || values.length === 0) {
    return null
  }

  if (values.includes(ActiveOptionsEnum.CURRENT)) {
    return 'true'
  }

  return 'false'
}

const filtersConfig = {
  isActive: {
    type: 'multiselect',
    label: 'Active',
    title: 'Filter by active state',
    options: isActiveOptions,
    defaultValue: [ActiveOptionsEnum.CURRENT, ActiveOptionsEnum.QUEUED],
    formatValue: (value) => checkActive(value) ? value : undefined,
    isAllSelected: (values) => values.length === isActiveOptions.length
  },
  blocks_proposed: {
    type: 'range',
    label: 'Blocks proposed',
    title: 'Blocks proposed',
    defaultValue: { min: '', max: '' },
    minTitle: 'Min',
    minPlaceholder: 'ex. 0',
    maxTitle: 'Max',
    maxPlaceholder: 'ex. 100',
    formatValue: ({ min, max }) => {
      if (min && max) return `${min} - ${max}`
      if (min) return `Min ${min}`
      if (max) return `Max ${max}`
      return null
    }
  },
  last_proposed_block_height: {
    type: 'range',
    label: 'Last block height',
    title: 'Last proposed block height',
    defaultValue: { min: '', max: '' },
    minTitle: 'Min height',
    minPlaceholder: 'ex. 1',
    maxTitle: 'Max height',
    maxPlaceholder: 'ex. 100000',
    formatValue: ({ min, max }) => {
      if (min && max) return `${min} - ${max}`
      if (min) return `Min ${min}`
      if (max) return `Max ${max}`
      return null
    }
  },
  last_proposed_block_timestamp: {
    label: 'Last block date',
    title: 'Date range',
    type: 'daterange',
    defaultValue: null,
    formatValue: (value) => `${value?.start ? `from ${value?.start?.toLocaleDateString()}` : ''} ${value?.end ? `to ${value?.end?.toLocaleDateString()}` : ''}`
  },
  last_proposed_block_hash: {
    label: 'Block hash',
    title: 'Filter by last proposed block hash',
    type: 'search',
    placeholder: 'HASH',
    defaultValue: '',
    formatValue: (value) => value || null,
    mobileTagRenderer: (value) => (
      <Identifier avatar={false} ellipsis={true} styles={['highlight-both']}>{value}</Identifier>
    )
  }
}

export const ValidatorsFilter = ({ onFilterChange, isMobile, className }) => {
  return (
    <Filters
      filtersConfig={filtersConfig}
      onFilterChange={(values) => {
        const payload = {
          isActive: checkActive(values.isActive) || undefined,
          blocks_proposed_min: values.blocks_proposed_min || undefined,
          blocks_proposed_max: values.blocks_proposed_max || undefined,
          last_proposed_block_height_min: values.last_proposed_block_height_min || undefined,
          last_proposed_block_height_max: values.last_proposed_block_height_max || undefined,
          last_proposed_block_timestamp_start: values.last_proposed_block_timestamp_start
            ? new Date(values.last_proposed_block_timestamp_start).toISOString()
            : undefined,
          last_proposed_block_timestamp_end: values.last_proposed_block_timestamp_end
            ? new Date(values.last_proposed_block_timestamp_end).toISOString()
            : undefined,
          last_proposed_block_hash: values.last_proposed_block_hash || undefined
        }
        onFilterChange && onFilterChange(payload)
      }}
      isMobile={isMobile}
      className={`ValidatorsFilter ${className || ''}`}
      buttonText={'Add filter'}
      applyOnChange={false}
    />
  )
}
