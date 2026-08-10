import { Input } from '@chakra-ui/react'
import type { ChangeEvent } from 'react'
import { SubmitButton } from '../ui/forms'
import FilterActions from './FilterActions'
import type { RangeFilterValue } from './types'
import './RangeFilter.scss'

interface RangeFilterProps {
  value?: RangeFilterValue
  onChange: (value: RangeFilterValue) => void
  type?: string
  minPlaceholder?: string
  minTitle?: string
  maxPlaceholder?: string
  maxTitle?: string
  showSubmitButton?: boolean
  onSubmit?: () => void
}

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
}: RangeFilterProps) => (
  <div className={'RangeFilter'}>
    <div className={'RangeFilter__InputContainer'}>
      <span className={'RangeFilter__InputTitle'} color='gray.600'>
        {minTitle}
      </span>
      <Input
        className={'RangeFilter__Input'}
        type={type}
        value={value.min || ''}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onChange({
            ...value,
            min: e.target.value
          })
        }
        placeholder={minPlaceholder}
      />
    </div>
    <div className={'RangeFilter__InputContainer'}>
      <span className={'RangeFilter__InputTitle'} color='gray.600'>
        {maxTitle}
      </span>
      <Input
        className={'RangeFilter__Input'}
        type={type}
        value={value.max || ''}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onChange({
            ...value,
            max: e.target.value
          })
        }
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
