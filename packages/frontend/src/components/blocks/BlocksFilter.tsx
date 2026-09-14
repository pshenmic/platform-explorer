import type { ComponentType, ReactNode } from 'react'
import type { WithClassName } from '../../types/common'
// Untyped JS components — loose wrappers until filters/* / data/* are migrated
import { Filters as FiltersJs } from '../filters'
import { Identifier as IdentifierJs } from '../data'

const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  avatar?: boolean
  ellipsis?: boolean
  styles?: string[]
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

interface RangeValue {
  min?: string | number
  max?: string | number
}

const filtersConfig = {
  height: {
    label: 'Height',
    title: 'Height Range',
    type: 'range',
    defaultValue: { min: '', max: '' },
    minTitle: 'Minimum amount',
    minPlaceholder: 'ex. 0...',
    maxTitle: 'Maximum amount',
    maxPlaceholder: 'ex. 10000000...',
    formatValue: ({ min, max }: RangeValue) => {
      if (min && max) return `${min} - ${max}`
      if (min) return `Min ${min}`
      if (max) return `Max ${max}`
      return null
    }
  },
  epoch_index: {
    label: 'Epoch',
    title: 'Epoch Range',
    type: 'range',
    defaultValue: { min: '', max: '' },
    minTitle: 'Minimum amount',
    minPlaceholder: 'ex. 0...',
    maxTitle: 'Maximum amount',
    maxPlaceholder: 'ex. 10000000...',
    formatValue: ({ min, max }: RangeValue) => {
      if (min && max) return `${min} - ${max}`
      if (min) return `Min ${min}`
      if (max) return `Max ${max}`
      return null
    }
  },
  tx_count: {
    label: 'TX count',
    title: 'Transactions count range',
    type: 'range',
    defaultValue: { min: '', max: '' },
    minTitle: 'Minimum amount',
    minPlaceholder: 'ex. 0...',
    maxTitle: 'Maximum amount',
    maxPlaceholder: 'ex. 10000000...',
    formatValue: ({ min, max }: RangeValue) => {
      if (min && max) return `${min} - ${max} txs`
      if (min) return `Min ${min} txs`
      if (max) return `Max ${max} txs`
      return null
    }
  },
  gas: {
    label: 'Gas',
    title: 'Gas Range',
    type: 'range',
    defaultValue: { min: '', max: '' },
    minTitle: 'Minimum amount',
    minPlaceholder: 'ex. 0...',
    maxTitle: 'Maximum amount',
    maxPlaceholder: 'ex. 10000000...',
    formatValue: ({ min, max }: RangeValue) => {
      if (min && max) return `${min} - ${max} Credits`
      if (min) return `Min ${min} Credits`
      if (max) return `Max ${max} Credits`
      return null
    }
  },
  validator: {
    label: 'Validator',
    title: 'Filter by validator',
    type: 'search',
    entityType: 'validators',
    placeholder: 'Validator Pro TX Hash',
    defaultValue: '',
    formatValue: (value: string) => value || null,
    mobileTagRenderer: (value: string) => (
      <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>
        {value}
      </Identifier>
    )
  },
  timestamp: {
    label: 'Date',
    title: 'Date range',
    type: 'daterange',
    defaultValue: null,
    formatValue: (value: { start?: Date | null; end?: Date | null } | null) => {
      return `${value?.start ? `from ${value?.start?.toLocaleDateString()}` : ''} ${value?.end ? `to ${value?.end?.toLocaleDateString()}` : ''}`
    }
  }
}

interface BlocksFilterProps extends WithClassName {
  initialFilters?: Record<string, unknown>
  onFilterChange?: (filters: Record<string, unknown>) => void
  isMobile?: boolean
}

export default function BlocksFilter({
  initialFilters,
  onFilterChange,
  isMobile,
  className
}: BlocksFilterProps) {
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
