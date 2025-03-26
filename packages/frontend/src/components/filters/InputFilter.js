import { Input } from '@chakra-ui/react'

export const InputFilter = ({
  value,
  onChange,
  placeholder,
  type = 'text'
}) => (
  <div>
    <Input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
)
