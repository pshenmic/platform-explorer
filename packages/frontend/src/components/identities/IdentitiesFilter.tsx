import type { ComponentType, ReactNode } from 'react'
import type { Identity, Document } from '../../types'
import { Filters as FiltersJs } from '@components/filters'

// Untyped JS modules — cast until migrated
const Filters = FiltersJs as ComponentType<{
  filtersConfig?: Record<string, unknown>
  initialFilters?: Record<string, unknown>
  onFilterChange?: (filters: Record<string, unknown>) => void
  isMobile?: boolean
  className?: string
  buttonText?: string
  applyOnChange?: boolean
}>

const IdentityTypeEnum = {
  REGULAR: 'regular',
  MASTERNODE: 'masternode'
}

const identityTypeOptions = [
  { label: 'Regular', title: 'Regular identities', value: IdentityTypeEnum.REGULAR },
  { label: 'Masternode', title: 'Masternode identities', value: IdentityTypeEnum.MASTERNODE }
]

const pickIdentityType = (values: unknown[] | null | undefined) => {
  if (!Array.isArray(values) || values.length === 0 || values.length === identityTypeOptions.length) {
    return undefined
  }
  return values[0]
}

const rangeFormat = ({ min, max }: { min?: string | number, max?: string | number }) => {
  if (min && max) return `${min} – ${max}`
  if (min) return `Min ${min}`
  if (max) return `Max ${max}`
  return null
}

const filtersConfig = {
  identity_type: {
    type: 'multiselect',
    label: 'Type',
    title: 'Filter by identity type',
    options: identityTypeOptions,
    defaultValue: [IdentityTypeEnum.REGULAR, IdentityTypeEnum.MASTERNODE],
    formatValue: (values: any) => pickIdentityType(values) || undefined,
    isAllSelected: (values: unknown[]) => values.length === identityTypeOptions.length
  },
  balance: {
    type: 'range',
    label: 'Balance',
    title: 'Balance (credits)',
    defaultValue: { min: '', max: '' },
    minTitle: 'Min',
    minPlaceholder: 'ex. 1000000',
    maxTitle: 'Max',
    maxPlaceholder: 'ex. 1000000000',
    formatValue: rangeFormat
  },
  tx_count: {
    type: 'range',
    label: 'Transactions',
    title: 'Total transactions',
    defaultValue: { min: '', max: '' },
    minTitle: 'Min',
    minPlaceholder: 'ex. 0',
    maxTitle: 'Max',
    maxPlaceholder: 'ex. 1000',
    formatValue: rangeFormat
  },
  documents_count: {
    type: 'range',
    label: 'Documents',
    title: 'Total documents',
    defaultValue: { min: '', max: '' },
    minTitle: 'Min',
    minPlaceholder: 'ex. 0',
    maxTitle: 'Max',
    maxPlaceholder: 'ex. 100',
    formatValue: rangeFormat
  },
  data_contracts: {
    type: 'range',
    label: 'Data contracts',
    title: 'Total data contracts',
    defaultValue: { min: '', max: '' },
    minTitle: 'Min',
    minPlaceholder: 'ex. 0',
    maxTitle: 'Max',
    maxPlaceholder: 'ex. 10',
    formatValue: rangeFormat
  }
}

interface IdentitiesFilterProps {
  initialFilters?: Record<string, unknown>
  onFilterChange?: (v: Record<string, unknown>) => void
  isMobile?: boolean
  className?: string
}

export const IdentitiesFilter = ({ initialFilters, onFilterChange, isMobile, className }: IdentitiesFilterProps) => {
  return (
    <Filters
      filtersConfig={filtersConfig}
      initialFilters={initialFilters}
      onFilterChange={(values: Record<string, unknown>) => {
        const payload = {
          identity_type: pickIdentityType(values.identity_type as unknown[]),
          balance_min: values.balance_min || undefined,
          balance_max: values.balance_max || undefined,
          tx_count_min: values.tx_count_min || undefined,
          tx_count_max: values.tx_count_max || undefined,
          documents_count_min: values.documents_count_min || undefined,
          documents_count_max: values.documents_count_max || undefined,
          data_contracts_min: values.data_contracts_min || undefined,
          data_contracts_max: values.data_contracts_max || undefined
        }
        onFilterChange && onFilterChange(payload as Record<string, unknown>)
      }}
      isMobile={isMobile}
      className={`IdentitiesFilter ${className || ''}`}
      buttonText={'Add filter'}
      applyOnChange={false}
    />
  )
}

export default IdentitiesFilter
