import { Input } from '@chakra-ui/react'
import { SubmitButton } from '../ui/forms'
import FilterActions from './FilterActions'
import './RangeFilter.scss'

export const RangeFilter = ({
  value = { min: '', max: '' },
  onChange,
  type = 'number',
  minPlaceholder = 'Min',
  minTitle = 'From',
  maxPlaceholder = 'Max',
  maxTitle = 'To',
  showSubmitButton = false,
  onSubmit
}) => (
  <div className={'RangeFilter'}>
    <div className={'RangeFilter__InputContainer'}>
      <span className={'RangeFilter__InputTitle'} color="gray.600">
        {minTitle}
      </span>
      <Input
        className={'RangeFilter__Input'}
        type={type}
        value={value.min || ''}
        onChange={(e) => onChange({
          ...value,
          min: e.target.value
        })}
        placeholder={minPlaceholder}
      />
    </div>
    <div className={'RangeFilter__InputContainer'}>
      <span className={'RangeFilter__InputTitle'} color="gray.600">
        {maxTitle}
      </span>
      <Input
        className={'RangeFilter__Input'}
        type={type}
        value={value.max || ''}
        onChange={(e) => onChange({
          ...value,
          max: e.target.value
        })}
        placeholder={maxPlaceholder}
      />
    </div>

    {showSubmitButton && (
      <FilterActions className={'RangeFilter__Actions'}>
        <SubmitButton onSubmit={onSubmit} />
      </FilterActions>
    )}
  </div>
)
