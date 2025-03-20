import { Box, Text, Input } from '@chakra-ui/react'

export const InputFilter = ({
  title,
  value,
  onChange,
  placeholder,
  type = 'text'
}) => (
  <Box mb={6}>
    <Box
      borderBottom='1px solid'
      borderColor='gray.200'
      pb={2}
      mb={3}
    >
      <Text fontWeight='semibold' fontSize='sm' color='gray.600'>
        {title}
      </Text>
    </Box>

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
