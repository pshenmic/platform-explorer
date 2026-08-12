'use client'

import { Button, Popover, PopoverTrigger, PopoverContent, PopoverBody } from '@chakra-ui/react'
import type { PopoverProps } from '@chakra-ui/react'
import MenuLevel from './MenuLevel'
import type { MenuItem } from './MenuLevel'
import { useCallback, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import './MultiLevelMenu.css'

interface MultiLevelMenuProps extends Omit<PopoverProps, 'children' | 'trigger'> {
  menuData?: MenuItem[]
  /** Must be a single element (PopoverTrigger clones it). Prefer a stable element. */
  trigger?: ReactElement
  placement?: PopoverProps['placement']
  onClose?: () => void
  onOpen?: () => void
  isOpen?: boolean
}

/**
 * Desktop multi-level filter menu.
 * Controlled mode: pass isOpen + onOpen + onClose from the parent.
 * Do not put a second open-toggle onClick on the trigger — PopoverTrigger owns the click.
 */
function MultiLevelMenu ({
  menuData = [],
  trigger,
  placement = 'right-start',
  onClose,
  onOpen,
  isOpen,
  ...props
}: MultiLevelMenuProps) {
  const [activeItemId, setActiveItemId] = useState<number | null>(null)

  const handleOpen = useCallback(() => {
    onOpen?.()
  }, [onOpen])

  const handleClose = useCallback(() => {
    setActiveItemId(null)
    onClose?.()
  }, [onClose])

  const handleActiveItemChange = useCallback((id: number | null) => {
    setActiveItemId(prev => (prev === id ? prev : id))
  }, [])

  const handleMenuItemClick = useCallback(() => {
    handleClose()
  }, [handleClose])

  return (
    <Popover
      isOpen={isOpen}
      onOpen={handleOpen}
      onClose={handleClose}
      closeOnBlur
      placement={placement}
      variant={'menu'}
      isLazy
      autoFocus={false}
      returnFocusOnClose={false}
      {...props}
    >
      <PopoverTrigger>
        {trigger ?? <Button type='button'>Open menu</Button>}
      </PopoverTrigger>
      <PopoverContent width={'auto'} minWidth={'180px'}>
        <PopoverBody overflow={'visible'} p={0}>
          <MenuLevel
            items={menuData}
            forceClose={isOpen === false}
            activeItemId={activeItemId}
            onActiveItemChange={handleActiveItemChange}
            onMenuItemClick={handleMenuItemClick}
          />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

export default MultiLevelMenu
