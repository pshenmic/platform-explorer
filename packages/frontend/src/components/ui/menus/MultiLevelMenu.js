import {
  Button, Popover, PopoverTrigger, PopoverContent, PopoverBody
  // useDisclosure
} from '@chakra-ui/react'
import MenuLevel from './MenuLevel'
import { useState } from 'react'
import './MultiLevelMenu.scss'

function MultiLevelMenu ({ menuData = [], trigger, placement = 'right-start', onClose, ...props }) {
  const [forceClose, setForceClose] = useState(false)

  const closeMenuHandler = () => {
    setForceClose(true)
    if (typeof onClose === 'function') onClose()
  }

  const openMenuHandler = () => {
    setForceClose(false)
  }

  return (
    <Popover
      onClose={closeMenuHandler}
      onOpen={openMenuHandler}
      closeOnBlur={true}
      placement={placement}
      variant={'menu'}
      {...props}
    >
      <PopoverTrigger>
        {trigger ||
          <Button>
            Open menu
          </Button>
        }
      </PopoverTrigger>
      <PopoverContent width={'auto'} minWidth={'180px'}>
        <PopoverBody>
          <MenuLevel
            items={menuData}
            forceClose={forceClose}
            // onMenuItemClick={handleCloseMenu}
            // placement={placement}
          />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

export default MultiLevelMenu
