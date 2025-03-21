import { Box, Button, Flex, Text, WrapItem } from '@chakra-ui/react'

export const MultiSelectFilter = ({
  title,
  items,
  selectedValues,
  onItemClick,
  onSelectAll,
  itemLabelKey = 'label',
  itemValueKey = 'value',
  showSelectAll = true
}) => {
  return (
    <Box mb={6}>
        <Box
          display='flex'
          justifyContent='space-between'
          alignItems='center'
          mb={3}
          pb={2}
        >
          <Text fontWeight='semibold' fontSize='sm' color='gray.600'>
            {title}
          </Text>

          {showSelectAll && (
            <Button
            size='xs'
            variant='ghost'
            onClick={onSelectAll}
            color='blue.500'
            _hover={{ bg: 'blue.50' }}
            >
            Select All
            </Button>
          )}
        </Box>

        <Flex flexWrap={'wrap'} gap={'0.5rem'} m={0}>
          {items.map((item) => (
            <WrapItem m={0} key={item[itemValueKey]}>
              <Button
                size='sm'
                variant={selectedValues.includes(item[itemValueKey]) ? 'solid' : 'outline'}
                colorScheme={selectedValues.includes(item[itemValueKey]) ? 'blue' : 'gray'}
                onClick={() => onItemClick(item[itemValueKey])}
                fontWeight='normal'
                fontSize='sm'
              >
                {item[itemLabelKey]}
              </Button>
            </WrapItem>
          ))}
        </Flex>
    </Box>
  )
}
