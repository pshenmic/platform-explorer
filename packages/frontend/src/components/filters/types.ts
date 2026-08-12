import type { ReactNode } from 'react'
import type { SearchCategory } from '../search/constants'

export type FilterType = 'multiselect' | 'range' | 'input' | 'search' | 'daterange'

export interface RangeFilterValue {
  min?: string | number | null
  max?: string | number | null
}

export interface DateRangeFilterValue {
  start?: Date | null
  end?: Date | null
}

/** Values stored in filter state (broader than useFilters' FilterValue). */
export type FilterStateValue =
  | string
  | string[]
  | number
  | boolean
  | null
  | undefined
  | RangeFilterValue
  | DateRangeFilterValue
  | Record<string, unknown>

export type FilterState = Record<string, FilterStateValue>

export interface MultiSelectOption {
  value: string
  label?: ReactNode
  title?: ReactNode
}

export interface FilterConfigItem {
  type: FilterType
  title?: ReactNode
  label?: string
  defaultValue?: FilterStateValue
  options?: MultiSelectOption[]
  placeholder?: string
  minTitle?: string
  minPlaceholder?: string
  maxTitle?: string
  maxPlaceholder?: string
  entityType?: SearchCategory
  isAllSelected?: (value: FilterStateValue) => boolean
  formatValue?: (value: FilterStateValue) => ReactNode
  mobileTagRenderer?: (value: FilterStateValue) => ReactNode
}

export type FiltersConfig = Record<string, FilterConfigItem>

export interface FilterMenuItem {
  label?: string
  title?: ReactNode
  content?: ReactNode
  activeFilterValue?: ReactNode
  type?: FilterType
  filterKey?: string
  rawValue?: FilterStateValue
  options?: MultiSelectOption[] | null
  mobileTagRenderer?: ((value: FilterStateValue) => ReactNode) | null
}
