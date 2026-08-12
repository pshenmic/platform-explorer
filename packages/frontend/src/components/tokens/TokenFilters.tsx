import type { ComponentType, ReactNode } from 'react'
import { Filters as FiltersJs } from '../filters'
// Untyped JS components — loose wrappers until data/* is migrated
import { Identifier as IdentifierJs } from '../data'
import type { WithClassName } from '../../types/common'

const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  avatar?: boolean
  ellipsis?: boolean
  styles?: string[]
}>
const Filters = FiltersJs as ComponentType<{
  filtersConfig?: Record<string, unknown>
  initialFilters?: Record<string, unknown>
  onFilterChange?: (values: Record<string, unknown>) => void
  isMobile?: boolean
  className?: string
  buttonText?: string
  applyOnChange?: boolean
}>

const filtersConfig = {
  owner: {
    label: 'Owner',
    title: 'Filter by owner',
    type: 'search',
    entityType: 'identities',
    placeholder: 'OWNER ID OR IDENTITY',
    defaultValue: '',
    formatValue: (value: string) => value || null,
    mobileTagRenderer: (value: string) => (
      <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>{value}</Identifier>
    )
  },
  data_contract: {
    label: 'Data Contract',
    title: 'Filter by Data Contract',
    type: 'search',
    entityType: 'dataContracts',
    placeholder: 'Data Contract name or identifier',
    defaultValue: '',
    formatValue: (value: string) => value || null,
    mobileTagRenderer: (value: string) => (
      <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>{value}</Identifier>
    )
  }
}

export interface TokenFilterPayload {
  owner?: string
  contract_id?: string
}

interface TokenFiltersProps extends WithClassName {
  initialFilters?: Record<string, unknown>
  onFilterChange?: (payload: TokenFilterPayload) => void
  isMobile?: boolean
}

export default function TokenFilters ({ initialFilters, onFilterChange, isMobile, className }: TokenFiltersProps) {
  return (
    <Filters
      filtersConfig={filtersConfig}
      initialFilters={initialFilters}
      onFilterChange={(values) => {
        const payload: TokenFilterPayload = {
          owner: (values.owner as string) || undefined,
          contract_id: (values.data_contract as string) || undefined
        }
        onFilterChange?.(payload)
      }}
      isMobile={isMobile}
      className={`TokenFilters ${className || ''}`}
      buttonText={'Add filter'}
      applyOnChange={false}
    />
  )
}
