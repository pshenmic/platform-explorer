import type { ComponentType, ReactNode } from 'react'
import IdentifierJs from '@components/data/Identifier'
import { Filters } from '@components/filters'
import type { FiltersConfig } from '@components/filters/types'
import type { WithClassName } from '../../types'

// Untyped JS component — loose wrapper until data/Identifier is migrated
const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  avatar?: boolean
  ellipsis?: boolean
  styles?: string[]
  className?: string
}>

const withTokensOptions = [
  {
    label: 'With tokens',
    title: 'Data contracts with tokens',
    value: 'with-tokens'
  },
  {
    label: 'Without tokens',
    title: 'Data contracts without tokens',
    value: 'without-tokens'
  }
]

const isSystemOptions = [
  { label: 'System', title: 'System contracts', value: 'system' },
  { label: 'Non-system', title: 'Non-system contracts', value: 'non-system' }
]

export interface DataContractsFilterPayload {
  owner?: string
  is_system?: string
  with_tokens?: string
  documents_count_min?: string | number
  documents_count_max?: string | number
  timestamp_start?: string
  timestamp_end?: string
}

const filtersConfig = {
  owner: {
    label: 'Owner',
    title: 'Filter by owner',
    type: 'search' as const,
    entityType: 'identities' as const,
    placeholder: 'OWNER ID OR IDENTITY',
    defaultValue: '',
    formatValue: (value: unknown) => (typeof value === 'string' ? value : null) || null,
    mobileTagRenderer: (value: unknown) => (
      <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>
        {value as ReactNode}
      </Identifier>
    )
  },
  is_system: {
    type: 'multiselect' as const,
    label: 'System',
    title: 'System',
    options: isSystemOptions,
    defaultValue: [] as string[],
    maxSelected: 2,
    formatValue: (value: unknown) => {
      const list = Array.isArray(value) ? value : []
      return (list[0] as string) ?? null
    },
    isAllSelected: (list: unknown) => Array.isArray(list) && list.length === isSystemOptions.length
  },
  with_tokens: {
    type: 'multiselect' as const,
    label: 'With tokens',
    title: 'With tokens',
    options: withTokensOptions,
    defaultValue: [] as string[],
    maxSelected: 1,
    formatValue: (value: unknown) => {
      const list = Array.isArray(value) ? value : []
      return (list[0] as string) ?? null
    },
    isAllSelected: (list: unknown) =>
      Array.isArray(list) && list.length === withTokensOptions.length
  },
  documents_count: {
    type: 'range' as const,
    label: 'Documents',
    title: 'Documents count',
    defaultValue: { min: '', max: '' },
    minTitle: 'Minimum count',
    minPlaceholder: 'ex. 0',
    maxTitle: 'Maximum count',
    maxPlaceholder: 'ex. 100',
    formatValue: (value: unknown) => {
      const range = value as { min?: string; max?: string } | null
      const min = range?.min
      const max = range?.max
      if (min && max) return `${min} - ${max}`
      if (min) return `Min ${min}`
      if (max) return `Max ${max}`
      return null
    }
  },
  timestamp: {
    label: 'Date',
    title: 'Date range',
    type: 'daterange' as const,
    defaultValue: null,
    formatValue: (value: unknown) => {
      const range = value as { start?: Date | null; end?: Date | null } | null
      return `${range?.start ? `from ${range?.start?.toLocaleDateString()}` : ''} ${range?.end ? `to ${range?.end?.toLocaleDateString()}` : ''}`
    }
  }
} as FiltersConfig

interface DataContractsFilterProps extends WithClassName {
  onFilterChange?: (payload: DataContractsFilterPayload) => void
  isMobile?: boolean
}

export const DataContractsFilter = ({
  onFilterChange,
  isMobile,
  className
}: DataContractsFilterProps) => {
  return (
    <Filters
      filtersConfig={filtersConfig}
      onFilterChange={values => {
        const isSystem = values.is_system
        const withTokens = values.with_tokens
        const [isSystemSelected] = Array.isArray(isSystem) ? isSystem : []
        const [withTokensSelected] = Array.isArray(withTokens) ? withTokens : []

        const payload: DataContractsFilterPayload = {
          owner: (values.owner as string) || undefined,
          is_system: (isSystemSelected as string) || undefined,
          with_tokens: (withTokensSelected as string) || undefined,
          documents_count_min: (values.documents_count_min as string | number) || undefined,
          documents_count_max: (values.documents_count_max as string | number) || undefined,
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
      className={`DataContractsFilter ${className || ''}`}
      buttonText={'Add filter'}
      applyOnChange={false}
    />
  )
}
