import type { MouseEvent, ReactNode } from 'react'
import { CloseIcon } from '../ui/icons'
import type { FilterState, FilterStateValue } from './types'
import './ActiveFilters.css'

interface ActiveFiltersProps {
  filters: FilterState
  onClearFilter: (key: string) => void
  formatValue?: (key: string, value: FilterStateValue) => ReactNode
  allValuesSelected?: (key: string, value: FilterStateValue) => boolean
  getFilterLabel?: (key: string) => ReactNode
}

export const ActiveFilters = ({
  filters,
  onClearFilter,
  formatValue,
  allValuesSelected = () => false,
  getFilterLabel = key => key
}: ActiveFiltersProps) => {
  const activeFilters = Object.entries(filters).filter(([key, value]) => {
    if (Array.isArray(value)) {
      return value.length > 0 && !allValuesSelected(key, value)
    }

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return Object.values(value).some(v => v !== '' && v !== undefined && v !== null)
    }

    return value !== '' && value !== undefined && value !== null
  })

  if (activeFilters.length === 0) return null

  return (
    <div className={'ActiveFilters__ItemsContainer'}>
      {activeFilters.map(([key, value]) => (
        <button type={'button'} className={'ActiveFilters__Item'} key={key}>
          {getFilterLabel(key)}: {formatValue ? formatValue(key, value) : (value as ReactNode)}
          <div
            className={'ActiveFilters__IconContainer'}
            onClick={(e: MouseEvent) => {
              e.stopPropagation()
              onClearFilter(key)
            }}
          >
            <CloseIcon />
          </div>
        </button>
      ))}
    </div>
  )
}
