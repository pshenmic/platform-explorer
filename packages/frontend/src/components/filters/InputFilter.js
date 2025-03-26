import { Input } from '@chakra-ui/react'
import { SubmitButton } from '../ui/forms'
import FilterActions from './FilterActions'

export const InputFilter = ({
  value,
  onChange,
  placeholder,
  type = 'text',
  showSubmitButton = false,
  onSubmit
}) => (
  <div className="InputFilter">
    <Input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />

    {showSubmitButton && (
      <FilterActions>
        <SubmitButton onSubmit={onSubmit} />
      </FilterActions>
    )}
  </div>
)
