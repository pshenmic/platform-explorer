import { Box, Text, SimpleGrid, Input } from '@chakra-ui/react'

export const RangeFilter = ({
  title,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  type = 'number',
  minPlaceholder = 'Min',
  maxPlaceholder = 'Max'
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

    <SimpleGrid columns={2} spacing={4}>
      <Box>
        <Text fontSize="xs" color="gray.600" mb={1}>
          From
        </Text>
        <Input
          type={type}
          value={minValue || ''}
          onChange={(e) => onMinChange(e.target.value)}
          placeholder={minPlaceholder}
          size="sm"
          borderRadius="md"
          _focus={{
            borderColor: 'blue.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)'
          }}
        />
      </Box>
      <Box>
        <Text fontSize="xs" color="gray.600" mb={1}>
          To
        </Text>
        <Input
          type={type}
          value={maxValue || ''}
          onChange={(e) => onMaxChange(e.target.value)}
          placeholder={maxPlaceholder}
          size="sm"
          borderRadius="md"
          _focus={{
            borderColor: 'blue.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)'
          }}
        />
      </Box>
    </SimpleGrid>
  </Box>
)
