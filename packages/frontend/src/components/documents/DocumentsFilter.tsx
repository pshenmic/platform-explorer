import type { ComponentType, ReactNode } from 'react'
import type { Document } from '../../types'
import IdentifierJs from '@components/data/Identifier'
import { Filters as FiltersJs } from '@components/filters'
import BatchTypeBadgeJs from '@components/transactions/BatchTypeBadge'
import { Badge } from '@chakra-ui/react'
import { BatchActions } from '../../enums/batchTypes'

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
const BatchTypeBadge = BatchTypeBadgeJs as ComponentType<{
  batchType?: string | null
  className?: string
}>

const actionOptions = [
  {
    label: <BatchTypeBadge batchType={'DOCUMENT_CREATE'} />,
    title: BatchActions.DOCUMENT_CREATE.title,
    value: 'DOCUMENT_CREATE'
  },
  {
    label: <BatchTypeBadge batchType={'DOCUMENT_REPLACE'} />,
    title: BatchActions.DOCUMENT_REPLACE.title,
    value: 'DOCUMENT_REPLACE'
  },
  {
    label: <BatchTypeBadge batchType={'DOCUMENT_DELETE'} />,
    title: BatchActions.DOCUMENT_DELETE.title,
    value: 'DOCUMENT_DELETE'
  }
]

const statusOptions = [
  {
    label: <Badge colorScheme={'green'}>Active</Badge>,
    title: 'Active',
    value: 'active'
  },
  {
    label: <Badge colorScheme={'red'}>Deleted</Badge>,
    title: 'Deleted',
    value: 'deleted'
  }
]

const filtersConfig = {
  document_type_name: {
    label: 'Type',
    title: 'Document type',
    type: 'input',
    placeholder: 'ex. note',
    defaultValue: '',
    formatValue: (value: any) => value || null
  },
  transition_type: {
    type: 'multiselect',
    label: 'Action',
    title: 'Action',
    options: actionOptions,
    defaultValue: actionOptions.map(a => a.value),
    formatValue: (values: any) => {
      if (values.length === actionOptions.length) return null
      if (values.length > 1) return `${values.length} actions`
      return actionOptions.find(a => a.value === values[0])?.title || values[0]
    },
    isAllSelected: (values: unknown[]) => values.length === actionOptions.length
  },
  status: {
    type: 'multiselect',
    label: 'Status',
    title: 'Status',
    options: statusOptions,
    defaultValue: statusOptions.map(s => s.value),
    formatValue: (values: any) => {
      if (values.length === statusOptions.length) return null
      if (values.length > 1) return `${values.length} values`
      return statusOptions.find(s => s.value === values[0])?.title || values[0]
    },
    isAllSelected: (values: unknown[]) => values.length === statusOptions.length
  },
  owner: {
    label: 'Owner',
    title: 'Filter by owner',
    type: 'search',
    entityType: 'identities',
    placeholder: 'OWNER ID OR IDENTITY',
    defaultValue: '',
    formatValue: (value: any) => value || null,
    mobileTagRenderer: (value: any) => (
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
    minPlaceholder: 'ex. 1',
    maxTitle: 'Maximum revision',
    maxPlaceholder: 'ex. 5',
    formatValue: ({ min, max }: { min?: string | number; max?: string | number }) => {
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
    formatValue: (value: any) =>
      `${value?.start ? `from ${value?.start?.toLocaleDateString()}` : ''} ${value?.end ? `to ${value?.end?.toLocaleDateString()}` : ''}`
  }
}

interface DocumentsFilterProps {
  onFilterChange?: (v: Record<string, unknown>) => void
  isMobile?: boolean
  className?: string
  excludeFilters?: string[]
}

export const DocumentsFilter = ({
  onFilterChange,
  isMobile,
  className,
  excludeFilters = []
}: DocumentsFilterProps) => {
  const config = excludeFilters.length
    ? Object.fromEntries(
        Object.entries(filtersConfig).filter(([key]) => !excludeFilters.includes(key))
      )
    : filtersConfig

  return (
    <Filters
      filtersConfig={config}
      onFilterChange={(values: Record<string, unknown>) => {
        const statusValues = values.status
        let deleted: string | undefined
        if (Array.isArray(statusValues) && statusValues.length === 1) {
          // 'true' / 'false' as strings — prepareQueryParams drops falsy values
          deleted = statusValues[0] === 'deleted' ? 'true' : 'false'
        }

        const payload = {
          document_type_name: values.document_type_name || undefined,
          transition_type: values.transition_type || undefined,
          deleted,
          owner: values.owner || undefined,
          revision_min: values.revision_min || undefined,
          revision_max: values.revision_max || undefined,
          timestamp_start: values.timestamp_start
            ? new Date(values.timestamp_start as string | number | Date).toISOString()
            : undefined,
          timestamp_end: values.timestamp_end
            ? new Date(values.timestamp_end as string | number | Date).toISOString()
            : undefined
        }
        onFilterChange && onFilterChange(payload as Record<string, unknown>)
      }}
      isMobile={isMobile}
      className={`DocumentsFilter ${className || ''}`}
      buttonText={'Add filter'}
      applyOnChange={false}
    />
  )
}
