import { Box, Button, Flex, WrapItem } from '@chakra-ui/react'
import Checkbox from '../ui/forms/Checkbox'
import './MultiSelectFilter.scss'

export const MultiSelectFilter = ({
  items,
  selectedValues,
  onItemClick,
  onSelectAll,
  showSelectAll = true
}) => {
  return (
    <div className={'MultiSelectFilter'}>
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        mb={3}
        pb={2}
      >
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
              <div
                className={'MultiSelectFilter__Item'}
                onClick={() => onItemClick(item?.value)}
              >
                <Checkbox forceChecked={selected}/>
                {item?.label}
              </div>
            </WrapItem>
          )
        })}
      </Flex>
    </div>
  )
}
