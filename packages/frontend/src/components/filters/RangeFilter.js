import { Box, Text, SimpleGrid, Input } from '@chakra-ui/react'

export const RangeFilter = ({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  type = 'number',
  minPlaceholder = 'Min',
  minTitle = 'From',
  maxPlaceholder = 'Max',
  maxTitle = 'To'
}) => (
  <Box mb={6}>
    <SimpleGrid columns={2} spacing={4}>
      <Box>
        <Text fontSize="xs" color="gray.600" mb={1}>
          {minTitle}
        </Text>
        <Input
          type={type}
          value={minValue || ''}
          onChange={(e) => onMinChange(e.target.value)}
          placeholder={minPlaceholder}
        />
      </Box>
      <Box>
        <Text fontSize="xs" color="gray.600" mb={1}>
          {maxTitle}
        </Text>
        <Input
          type={type}
          value={maxValue || ''}
          onChange={(e) => onMaxChange(e.target.value)}
          placeholder={maxPlaceholder}
        />
      </Box>
    </SimpleGrid>
  </Box>
)
