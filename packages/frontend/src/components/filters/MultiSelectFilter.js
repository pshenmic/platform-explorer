import { Button } from '@chakra-ui/react'
import { Checkbox, SubmitButton } from '../ui/forms'
import FilterActions from './FilterActions'
import './MultiSelectFilter.scss'

export const MultiSelectFilter = ({
  items = [],
  selectedValues = [],
  onItemClick,
  onSelectAll,
  showToggleAll = false,
  showSubmitButton = false,
  onSubmit
}) => {
  const isAllSelected = items.length === selectedValues.length

  const handleToggleAll = () => {
    if (isAllSelected) {
      onSelectAll([])
    } else {
      onSelectAll(items.map(item => item.value))
    }
  }

  return (
    <div className={'MultiSelectFilter'}>
      {items.map((item) => (
        <div
          key={item.value}
          className={`MultiSelectFilter__Item ${selectedValues.includes(item.value) ? 'selected' : ''}`}
          onClick={() => onItemClick(item.value)}
        >
          <Checkbox forceChecked={selectedValues.includes(item.value)}/>
          {item.label}
        </div>
      ))}

      {(showToggleAll || showSubmitButton) && (
        <FilterActions>
          {showSubmitButton && (
            <SubmitButton onSubmit={onSubmit}/>
          )}

          {showToggleAll && (
            <Button
              size={'sm'}
              variant={'outline'}
              onClick={handleToggleAll}
            >
              {isAllSelected ? 'Unselect all' : 'Select all'}
            </Button>
          )}
        </FilterActions>
      )}
    </div>
  )
}
