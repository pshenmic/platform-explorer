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
    <>
      <div className='MultiSelectFilter_List'>
        {items.map((item) => (
          <div
            key={item.value}
            className={`MultiSelectFilter__Item ${selectedValues.includes(item.value) ? 'MultiSelectFilter__Item--Selected' : ''}`}
            onClick={() => onItemClick(item.value)}
          >
            <Checkbox
              className={'MultiSelectFilter__ItemCheckbox'}
              forceChecked={selectedValues.includes(item.value)}
            />
            <div className={'MultiSelectFilter__ItemTitle'}>
              {item.label}
            </div>
          </div>
        ))}
      </div>
      {(showToggleAll || showSubmitButton) && (
        <FilterActions>
          {showSubmitButton && (
            <SubmitButton className={'MultiSelectFilter__ActionButton MultiSelectFilter__ActionButton--Submit'} onSubmit={onSubmit} />
          )}

          {showToggleAll && (
            <Button
              className={'MultiSelectFilter__ActionButton MultiSelectFilter__ActionButton--ToggleAll'}
              size={'sm'}
              variant={'gray'}
              onClick={handleToggleAll}
            >
              {isAllSelected ? 'Unselect all' : 'Select all'}
            </Button>
          )}
        </FilterActions>
      )}
    </>
  )
}
