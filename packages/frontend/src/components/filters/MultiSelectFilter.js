import { Box, Button, Flex, Text, WrapItem } from '@chakra-ui/react'

import Checkbox from '../ui/forms/Checkbox'

export const MultiSelectFilter = ({
  title,
  items,
  selectedValues,
  onItemClick,
  onSelectAll,
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

        <Flex
          flexDirection={'column'}
          gap={'1.25rem'}
          flexWrap={'wrap'}
          m={0}
        >
          {items.map((item) => {
            const selected = selectedValues.includes(item?.value)

            return (
              <WrapItem m={0} key={item?.value}>
                <Flex
                  alignItems={'center'}
                  gap={'0.75rem'}
                  onClick={() => onItemClick(item?.value)}
                  fontSize='sm'
                >
                  <Checkbox forceChecked={selected}/>
                  {item?.label}
                </Flex>
              </WrapItem>
            )
          })}
        </Flex>
    </Box>
  )
}
