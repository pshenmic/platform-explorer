import { Button } from '@chakra-ui/react'
import Checkbox from '../ui/forms/Checkbox'
import { SubmitButton } from './SubmitButton'
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
    <div className="MultiSelectFilter">
      {showToggleAll && (
        <div
          className={'MultiSelectFilter__Item'}
          onClick={handleToggleAll}
        >
          {isAllSelected ? 'Unselect all' : 'Select all'}
        </div>
      )}

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
        <div className={'MultiSelectFilter__Actions'}>
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
        </div>
      )}
    </div>
  )
}
