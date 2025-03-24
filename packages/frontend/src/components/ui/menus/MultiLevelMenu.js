import {
  Button, Popover, PopoverTrigger, PopoverContent, PopoverBody
  // useDisclosure
} from '@chakra-ui/react'
import MenuLevel from './MenuLevel'
import './MultiLevelMenu.scss'

function MultiLevelMenu ({ menuData = [], trigger, placement = 'right-start', ...props }) {
  // const { isOpen, onOpen, onClose } = useDisclosure()

  // const handleCloseMenu = () => {
  //   onClose()
  // }

  return (
    <Popover
      // isOpen={isOpen}
      // isOpen={true}
      // onClose={onClose}
      closeOnBlur={true}
      placement={placement}
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
      <PopoverContent borderRadius="md" shadow="md" width="auto" minWidth="180px">
        <PopoverBody p={0}>
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
