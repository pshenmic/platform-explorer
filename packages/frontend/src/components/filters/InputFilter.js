import { Input } from '@chakra-ui/react'
import { SubmitButton } from '../ui/forms'
import FilterActions from './FilterActions'
import './InputFilter.scss'

export const InputFilter = ({
  value,
  onChange,
  placeholder,
  type = 'text',
  showSubmitButton = false,
  onSubmit,
  title
}) => (
  <div className={'InputFilter'}>
    {title &&
      <div className={'InputFilter__Title'}>{title}</div>
    }

    <Input
      className={'InputFilter__Input'}
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
