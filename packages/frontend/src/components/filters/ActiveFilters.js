import { Button } from '@chakra-ui/react'
import { CloseIcon } from '../ui/icons'
import './ActiveFilters.scss'

export const ActiveFilters = ({
  filters,
  onClearFilter,
  formatValue,
  allValuesSelected = () => false,
  getFilterLabel = (key) => key
}) => {
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
        <Button
          className={'ActiveFilters__Item'}
          key={key}
          size={'sm'}
          variant={'gray'}
          rightIcon={
            <div
              className={'ActiveFilters__IconContainer'}
              onClick={(e) => {
                e.stopPropagation()
                onClearFilter(key)
              }}
            >
              <CloseIcon/>
            </div>
          }
        >
          {getFilterLabel(key)}: {formatValue ? formatValue(key, value) : value}
        </Button>
      ))}
    </div>
  )
}
