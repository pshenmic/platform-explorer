import {
  Button, Popover, PopoverTrigger, PopoverContent, PopoverBody
  // useDisclosure
} from '@chakra-ui/react'
import MenuLevel from './MenuLevel'
import './MultiLevelMenu.scss'

function MultiLevelMenu ({ menuData = [], trigger, placement = 'right-start', onClose, ...props }) {
  // const { isOpen, onOpen, onClose } = useDisclosure()

  const handleCloseMenu = () => {
    if (typeof onClose === 'function') onClose()
  }

  return (
    <Popover
      // isOpen={isOpen}
      // isOpen={true}
      onClose={handleCloseMenu}
      closeOnBlur={true}
      placement={placement}
      variant={'menu'}
      {...props}
    >
      <PopoverTrigger>
        {trigger ||
          <Button
            // onClick={onOpen}
          >
            Open menu
          </Button>
        }
      </PopoverTrigger>
      <PopoverContent width={'auto'} minWidth={'180px'}>
        <PopoverBody>
          <MenuLevel
            items={menuData}
            // onMenuItemClick={handleCloseMenu}
            // placement={placement}
          />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

export default MultiLevelMenu
