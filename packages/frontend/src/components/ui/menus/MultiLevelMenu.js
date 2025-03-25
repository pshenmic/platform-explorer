import { Button, Popover, PopoverTrigger, PopoverContent, PopoverBody } from '@chakra-ui/react'
import MenuLevel from './MenuLevel'
import { useState } from 'react'
import './MultiLevelMenu.scss'

function MultiLevelMenu ({ menuData = [], trigger, placement = 'right-start', onClose, ...props }) {
  const [forceClose, setForceClose] = useState(false)
  const [activeItemId, setActiveItemId] = useState(null)

  const closeMenuHandler = () => {
    setForceClose(true)
    setActiveItemId(null)
    if (typeof onClose === 'function') onClose()
  }

  const openMenuHandler = () => {
    setForceClose(false)
  }

  const handleActiveItemChange = (id) => {
    setActiveItemId(id)
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
            activeItemId={activeItemId}
            onActiveItemChange={handleActiveItemChange}
          />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

export default MultiLevelMenu
