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
  /** Single element for PopoverTrigger (no competing onClick). */
  trigger?: ReactElement
  placement?: PopoverProps['placement']
  onClose?: () => void
  onOpen?: () => void
  isOpen?: boolean
}

/**
 * One Chakra Popover + optional split layout:
 * - left: item list
 * - right: selected item.content (or nested links)
 *
 * Used by Filters (forms) and NavDropdown (links only — no panel).
 */
function MultiLevelMenu ({
  menuData = [],
  trigger,
  placement = 'bottom-start',
  onClose,
  onOpen,
  isOpen,
  ...props
}: MultiLevelMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const handleOpen = useCallback(() => {
    setSelectedIndex(null)
    onOpen?.()
  }, [onOpen])

  const handleClose = useCallback(() => {
    setSelectedIndex(null)
    onClose?.()
  }, [onClose])

  const selected = selectedIndex != null ? menuData[selectedIndex] : undefined
  const showPanel = Boolean(selected?.content || selected?.subMenu?.length)

  return (
    <div className={'MultiLevelMenu'}>
      <Popover
        isOpen={isOpen}
        onOpen={handleOpen}
        onClose={handleClose}
        closeOnBlur
        // Filters sit on the right of the toolbar: grow left into free space (end = right edge of trigger)
        placement={placement}
        variant={'menu'}
        isLazy
        autoFocus={false}
        returnFocusOnClose={false}
        gutter={4}
        strategy='absolute'
        modifiers={[
          {
            name: 'preventOverflow',
            options: {
              padding: 12,
              altAxis: true,
              tether: false,
              boundary: 'clippingParents'
            }
          },
          {
            name: 'flip',
            options: {
              fallbackPlacements: ['bottom-end', 'bottom-start', 'top-end', 'top-start', 'left-start']
            }
          }
        ]}
        {...props}
      >
        <PopoverTrigger>
          {trigger ?? <Button type='button'>Open menu</Button>}
        </PopoverTrigger>
        <PopoverContent
          className={`MultiLevelMenu__Content${showPanel ? ' MultiLevelMenu__Content--WithPanel' : ''}`}
          width='auto'
          maxW='min(960px, calc(100vw - 24px))'
          rootProps={{ style: { zIndex: 1500 } }}
        >
          <PopoverBody p={0} className={'MultiLevelMenu__Body'}>
            <div className={'MultiLevelMenu__Layout'}>
              <div className={'MultiLevelMenu__Nav'}>
                <MenuLevel
                  items={menuData}
                  selectedIndex={selectedIndex}
                  onSelectIndex={setSelectedIndex}
                  onMenuItemClick={handleClose}
                />
              </div>
              {showPanel && (
                <div className={'MultiLevelMenu__Panel'}>
                  {selected?.content}
                  {selected?.subMenu?.length
                    ? (
                      <MenuLevel
                        items={selected.subMenu}
                        onMenuItemClick={handleClose}
                      />
                      )
                    : null}
                </div>
              )}
            </div>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default MultiLevelMenu
