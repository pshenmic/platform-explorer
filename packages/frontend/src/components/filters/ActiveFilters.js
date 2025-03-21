import { Button, HStack, Icon, Text } from '@chakra-ui/react'
import { CloseIcon } from '@chakra-ui/icons'

export const ActiveFilters = ({ filters, onClearFilter }) => {
  // Skip empty filters
  const activeFilters = Object.entries(filters).filter(([_, value]) => {
    if (Array.isArray(value)) return value.length > 0
    return value !== '' && value !== undefined
  })

  if (activeFilters.length === 0) return null

  return (
    <HStack spacing={2} mb={4} wrap="wrap">
      {activeFilters.map(([key, value]) => (
        <Button
          key={key}
          size="sm"
          variant="outline"
          colorScheme="blue"
          rightIcon={
            <Icon
              as={CloseIcon}
              boxSize={2}
              onClick={(e) => {
                e.stopPropagation()
                onClearFilter(key)
              }}
            />
          }
        >
          <Text>
            {key}: {Array.isArray(value) ? value.join(', ') : value}
          </Text>
        </Button>
      ))}
    </HStack>
  )
}

export default ActiveFilters
