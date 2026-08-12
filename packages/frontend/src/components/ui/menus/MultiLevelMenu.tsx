'use client'

import { Button, Popover, PopoverTrigger, PopoverContent, PopoverBody } from '@chakra-ui/react'
import type { PopoverProps } from '@chakra-ui/react'
import MenuLevel from './MenuLevel'
import type { MenuItem } from './MenuLevel'
import { useCallback, useState } from 'react'
import type { ReactElement } from 'react'
import './MultiLevelMenu.css'

interface MultiLevelMenuProps extends Omit<PopoverProps, 'children' | 'trigger'> {
  menuData?: MenuItem[]
  /** Single React element — PopoverTrigger will clone it. Do not put a competing onClick. */
  trigger?: ReactElement
  placement?: PopoverProps['placement']
  onClose?: () => void
  onOpen?: () => void
  isOpen?: boolean
}

/**
 * Root filter menu: one Chakra Popover only.
 * Nested levels are CSS flyouts inside MenuLevel (no nested Popovers).
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

  return (
    <div className={'MultiLevelMenu'}>
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
        gutter={8}
        {...props}
      >
        <PopoverTrigger>
          {trigger ?? <Button type='button'>Open menu</Button>}
        </PopoverTrigger>
        <PopoverContent className={'MultiLevelMenu__Content'} width={'auto'} minWidth={'180px'}>
          <PopoverBody overflow={'visible'} p={2}>
            <MenuLevel
              items={menuData}
              forceClose={isOpen === false}
              activeItemId={activeItemId}
              onActiveItemChange={setActiveItemId}
              onMenuItemClick={handleClose}
            />
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default MultiLevelMenu
