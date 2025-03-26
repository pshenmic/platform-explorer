import { Button, Popover, PopoverTrigger, PopoverContent, PopoverBody } from '@chakra-ui/react'
import MenuLevel from './MenuLevel'
import { useState } from 'react'
import './MultiLevelMenu.scss'

function MultiLevelMenu ({
  menuData = [],
  trigger,
  placement = 'right-start',
  onClose,
  onOpen,
  isOpen: forceIsOpen,
  ...props
}) {
  const [forceClose, setForceClose] = useState(false)
  const [activeItemId, setActiveItemId] = useState(null)

  const closeMenuHandler = () => {
    setForceClose(true)
    setActiveItemId(null)
    if (typeof onClose === 'function') onClose()
  }

  const openMenuHandler = () => {
    setForceClose(false)
    if (typeof onOpen === 'function') onOpen()
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
      isOpen={forceIsOpen}
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
        <PopoverBody overflow={'visible'}>
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
