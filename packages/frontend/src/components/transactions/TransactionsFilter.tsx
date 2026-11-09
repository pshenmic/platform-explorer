import { TransactionTypesInfo } from '../../enums/state.transition.type'
import { TransactionStatusBadge, TypeBadge } from './index'
import BatchTypeBadge from './BatchTypeBadge'
import { BatchActions } from '../../enums/batchTypes'
import { Filters } from '../filters'
import { Identifier } from '../data'

const transactionOptions = Object.entries(TransactionTypesInfo)
  .filter(([type]) => type !== 'BATCH')
  .map(([type, info]) => ({
    label: <TypeBadge type={type} />,
    title: info.title,
    value: type
  }))

const batchOptions = Object.entries(BatchActions).map(([type, info]) => ({
  label: <BatchTypeBadge batchType={type} />,
  title: info.title,
  value: type
}))

const statusOptions = [
  {
    label: <TransactionStatusBadge status={'SUCCESS'} />,
    title: 'Success',
    value: 'SUCCESS'
  },
  {
    label: <TransactionStatusBadge status={'FAIL'} />,
    title: 'Fail',
    value: 'FAIL'
  }
]

const filtersConfig = {
  transaction_type: {
    type: 'multiselect',
    label: 'Transaction Type',
    title: 'Transaction Types',
    options: transactionOptions,
    defaultValue: transactionOptions.map(t => t.value),
    formatValue: (values: any) => {
      if (values.length === transactionOptions.length) return null
      if (values.length > 1) return `${values.length} categories`
      return transactionOptions.find(t => t.value === values[0])?.title || values[0]
    },
    isAllSelected: (values: any) => values.length === transactionOptions.length
  },
  batch_type: {
    type: 'multiselect',
    label: 'Batch Type',
    title: 'Batch Types',
    options: batchOptions,
    defaultValue: batchOptions.map(t => t.value),
    formatValue: (values: any) => {
      if (values.length === batchOptions.length) return null
      if (values.length > 1) return `${values.length} categories`
      return batchOptions.find(t => t.value === values[0])?.title || values[0]
    },
    isAllSelected: (values: any) => values.length === batchOptions.length
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
    isAllSelected: (values: any) => values.length === statusOptions.length
  },
  gas: {
    type: 'range',
    label: 'Gas',
    title: 'Gas Range',
    defaultValue: { min: '', max: '' },
    minTitle: 'Minimum amount',
    minPlaceholder: 'ex. 0...',
    maxTitle: 'Maximum amount',
    maxPlaceholder: 'ex. 10000000...',
    formatValue: ({ min, max }: any) => {
      if (min && max) return `${min} - ${max} Credits`
      if (min) return `Min ${min} Credits`
      if (max) return `Max ${max} Credits`
      return null
    }
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
  timestamp: {
    label: 'Date',
    title: 'Date range',
    type: 'daterange',
    defaultValue: null,
    formatValue: (value: any) => {
      return `${value?.start ? `from ${value?.start?.toLocaleDateString()}` : ''} ${value?.end ? `to ${value?.end?.toLocaleDateString()}` : ''}`
    }
  }
}

export const TRANSACTION_TYPE_VALUES = transactionOptions.map(o => o.value)
export const BATCH_TYPE_VALUES = batchOptions.map(o => o.value)
export const TRANSACTION_TYPE_FILTER_OPTIONS = transactionOptions.map(o => ({
  value: o.value,
  label: o.label,
  searchText: o.title
}))
export const BATCH_TYPE_FILTER_OPTIONS = batchOptions.map(o => ({
  value: o.value,
  label: o.label,
  searchText: o.title
}))
export const STATUS_FILTER_OPTIONS = statusOptions.map(o => ({
  value: o.value,
  label: o.label,
  searchText: o.title
}))
export const TYPE_FILTER_OPTIONS = [
  ...TRANSACTION_TYPE_FILTER_OPTIONS,
  ...BATCH_TYPE_FILTER_OPTIONS
]

export default function TransactionsFilter({
  onFilterChange,
  isMobile,
  className,
  excludeFilters = [],
  initialFilters
}: {
  onFilterChange?: (filters: Record<string, unknown>) => void
  isMobile?: boolean
  className?: string
  excludeFilters?: string[]
  initialFilters?: { transaction_type?: string[]; batch_type?: string[] }
}) {
  const config = excludeFilters.length
    ? Object.fromEntries(
        Object.entries(filtersConfig).filter(([key]) => !excludeFilters.includes(key))
      )
    : filtersConfig

  const urlKey = [
    (initialFilters?.transaction_type || []).join(','),
    (initialFilters?.batch_type || []).join(',')
  ].join('|')

  return (
    <Filters
      key={urlKey}
      filtersConfig={config as any}
      initialFilters={initialFilters}
      onFilterChange={onFilterChange}
      isMobile={isMobile}
      className={`TransactionsFilter ${className || ''}`}
      buttonText={'Add filter'}
      applyOnChange={false}
    />
  )
}
