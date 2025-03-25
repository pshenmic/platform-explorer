import { Box, Button } from '@chakra-ui/react'
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
            size={'xs'}
            variant={'ghost'}
            onClick={onSelectAll}
            color={'blue.500'}
            _hover={{ bg: 'blue.50' }}
          >
            Select All
          </Button>
        )}
      </Box>

      <div className={'MultiSelectFilter__Items'}>
        {items.map((item) => {
          const selected = selectedValues.includes(item?.value)

          return (
            <div
              className={'MultiSelectFilter__Item'}
              onClick={() => onItemClick(item?.value)}
              key={item?.value}
            >
              <Checkbox forceChecked={selected}/>
              {item?.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}
