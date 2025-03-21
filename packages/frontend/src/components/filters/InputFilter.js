import { Box, Input } from '@chakra-ui/react'

export const InputFilter = ({
  value,
  onChange,
  placeholder,
  type = 'text'
}) => (
  <Box mb={6}>
    <Input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </Box>
)
