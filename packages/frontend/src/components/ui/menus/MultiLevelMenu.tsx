import { useOutsideClick } from '../../../hooks/useOutsideClick'
import { Button, Popover, PopoverTrigger, PopoverContent, PopoverBody } from '@chakra-ui/react'
import type { PopoverProps } from '@chakra-ui/react'
import MenuLevel from './MenuLevel'
import type { MenuItem } from './MenuLevel'
import { useState, useRef } from 'react'
import type { ReactNode } from 'react'
import './MultiLevelMenu.css'

interface MultiLevelMenuProps extends Omit<PopoverProps, 'children' | 'trigger'> {
  menuData?: MenuItem[]
  trigger?: ReactNode
  placement?: PopoverProps['placement']
  onClose?: () => void
  onOpen?: () => void
  isOpen?: boolean
}

function MultiLevelMenu ({
  menuData = [],
  trigger,
  placement = 'right-start',
  onClose,
  onOpen,
  isOpen: forceIsOpen,
  ...props
}: MultiLevelMenuProps) {
  const [forceClose, setForceClose] = useState(false)
  const [activeItemId, setActiveItemId] = useState<number | null>(null)
  const menuRef = useRef<HTMLElement | null>(null)

  const closeMenuHandler = () => {
    setForceClose(true)
    setActiveItemId(null)
    if (typeof onClose === 'function') onClose()
  }

  const openMenuHandler = () => {
    // Avoid re-entrant open while parent already keeps Popover open (controlled isOpen)
    if (forceIsOpen) {
      setForceClose(false)
      return
    }
    setForceClose(false)
    if (typeof onOpen === 'function') onOpen()
  }

  const handleActiveItemChange = (id: number | null) => {
    setActiveItemId(prev => (prev === id ? prev : id))
  }

  useOutsideClick({
    ref: menuRef,
    handler: closeMenuHandler
  })

  return (
    <Popover
      onClose={closeMenuHandler}
      onOpen={openMenuHandler}
      closeOnBlur={true}
      placement={placement}
      variant={'menu'}
      isLazy
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
      <PopoverContent width={'auto'} minWidth={'180px'} ref={menuRef}>
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
