import { Box, Text, Input } from '@chakra-ui/react'

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
      size="sm"
      borderRadius="md"
      _focus={{
        borderColor: 'blue.500',
        boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)'
      }}
    />
  </Box>
)
