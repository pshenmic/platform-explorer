import { Box, Button } from '@chakra-ui/react'
import { CloseIcon } from '../ui/icons'

export const ActiveFilters = ({
  filters,
  onClearFilter,
  formatValue,
  isFilterSelected = () => false,
  getFilterLabel = (key) => key
}) => {
  const activeFilters = Object.entries(filters).filter(([key, value]) => {
    if (Array.isArray(value)) {
      return value.length > 0 && !isFilterSelected(key, value)
    }
    return value !== '' && value !== undefined && value !== null
  })

  if (activeFilters.length === 0) return null

  return (
    <Box display={'flex'} flexWrap={'wrap'} gap={2} mb={4}>
      {activeFilters.map(([key, value]) => (
        <Button
          key={key}
          size={'sm'}
          variant={'gray'}
          rightIcon={
            <CloseIcon
              boxSize={2}
              cursor={'pointer'}
              onClick={(e) => {
                e.stopPropagation()
                onClearFilter(key)
              }}
            />
          }
        >
          {getFilterLabel(key)}: {formatValue ? formatValue(key, value) : value}
        </Button>
      ))}
    </Box>
  )
}
