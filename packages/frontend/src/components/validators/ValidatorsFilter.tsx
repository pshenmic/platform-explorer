import type { ComponentType, ReactNode } from 'react'
import type { Validator } from '../../types'
import IdentifierJs from '@components/data/Identifier'
import { Filters as FiltersJs } from '@components/filters'

// Untyped JS modules — cast until migrated
const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  className?: string
  avatar?: boolean
  ellipsis?: boolean
  middleEllipsis?: boolean
  copyButton?: boolean
  styles?: string[]
  clickable?: boolean
  alias?: string
}>
const Filters = FiltersJs as ComponentType<{
  filtersConfig?: Record<string, unknown>
  initialFilters?: Record<string, unknown>
  onFilterChange?: (filters: Record<string, unknown>) => void
  isMobile?: boolean
  className?: string
  buttonText?: string
  applyOnChange?: boolean
}>

const ActiveOptionsEnum = {
  CURRENT: 'Current',
  QUEUED: 'Queued'
}

const isActiveOptions = [
  { label: 'Current', title: 'Currently active validators', value: ActiveOptionsEnum.CURRENT },
  { label: 'Queued', title: 'Currently active validators', value: ActiveOptionsEnum.QUEUED }
]

const checkActive = (values: unknown[] | null | undefined) => {
  if (!values || !Array.isArray(values) || values.length === 0) {
    return null
  }

  if ((values as string[]).includes(ActiveOptionsEnum.CURRENT)) {
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
    formatValue: (value: any) => checkActive(value) ? value : undefined,
    isAllSelected: (values: unknown[]) => values.length === isActiveOptions.length
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
    formatValue: ({ min, max }: { min?: string | number, max?: string | number }) => {
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
    formatValue: ({ min, max }: { min?: string | number, max?: string | number }) => {
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
    formatValue: (value: any) => `${value?.start ? `from ${value?.start?.toLocaleDateString()}` : ''} ${value?.end ? `to ${value?.end?.toLocaleDateString()}` : ''}`
  },
  last_proposed_block_hash: {
    label: 'Block hash',
    title: 'Filter by last proposed block hash',
    type: 'search',
    placeholder: 'HASH',
    defaultValue: '',
    formatValue: (value: any) => value || null,
    mobileTagRenderer: (value: any) => (
      <Identifier avatar={false} ellipsis={true} styles={['highlight-both']}>{value}</Identifier>
    )
  }
}

interface ValidatorsFilterProps {
  onFilterChange?: (v: Record<string, unknown>) => void
  isMobile?: boolean
  className?: string
}

export const ValidatorsFilter = ({ onFilterChange, isMobile, className }: ValidatorsFilterProps) => {
  return (
    <Filters
      filtersConfig={filtersConfig}
      onFilterChange={(values: Record<string, unknown>) => {
        const payload = {
          isActive: checkActive(values.isActive as unknown[]) || undefined,
          blocks_proposed_min: values.blocks_proposed_min || undefined,
          blocks_proposed_max: values.blocks_proposed_max || undefined,
          last_proposed_block_height_min: values.last_proposed_block_height_min || undefined,
          last_proposed_block_height_max: values.last_proposed_block_height_max || undefined,
          last_proposed_block_timestamp_start: values.last_proposed_block_timestamp_start
            ? new Date(values.last_proposed_block_timestamp_start as string | number | Date).toISOString()
            : undefined,
          last_proposed_block_timestamp_end: values.last_proposed_block_timestamp_end
            ? new Date(values.last_proposed_block_timestamp_end as string | number | Date).toISOString()
            : undefined,
          last_proposed_block_hash: values.last_proposed_block_hash || undefined
        }
        onFilterChange && onFilterChange(payload as Record<string, unknown>)
      }}
      isMobile={isMobile}
      className={`ValidatorsFilter ${className || ''}`}
      buttonText={'Add filter'}
      applyOnChange={false}
    />
  )
}
