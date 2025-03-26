import { Button } from '@chakra-ui/react'
import Checkbox from '../ui/forms/Checkbox'
import './MultiSelectFilter.scss'

export const MultiSelectFilter = ({
  items = [],
  selectedValues = [],
  onItemClick,
  onSelectAll,
  showToggleAll = false
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
      {showToggleAll && (
        <Button
          size={'sm'}
          onClick={handleToggleAll}
        >
          {isAllSelected ? 'Unselect all' : 'Select all'}
        </Button>
      )}
    </div>
  )
}
