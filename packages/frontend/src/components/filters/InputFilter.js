import { Input } from '@chakra-ui/react'
import { SubmitButton } from './SubmitButton'

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
      <div className={'InputFilter__Actions'}>
        <SubmitButton onSubmit={onSubmit} />
      </div>
    )}
  </div>
)
