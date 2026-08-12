'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from '@chakra-ui/react'
import { ChevronIcon } from '../icons'
import './MenuLevel.css'

export interface MenuItem {
  label?: ReactNode
  link?: string
  disabled?: boolean
  onClick?: () => void
  subMenu?: MenuItem[]
  content?: ReactNode
}

interface MenuLevelProps {
  items?: MenuItem[]
  onMenuItemClick?: () => void
  /** kept for API compat; flyouts are always right of the item */
  placement?: string
  onLevelClose?: () => void
  forceClose?: boolean
  activeItemId?: number | null
  onActiveItemChange?: (id: number | null) => void
}

/**
 * One column of a multi-level menu.
 * Submenus / filter panels use CSS flyouts — not nested Chakra Popovers
 * (nested controlled Popovers caused Maximum update depth with Filters).
 */
function MenuLevel ({
  items = [],
  onMenuItemClick,
  onLevelClose,
  forceClose,
  activeItemId,
  onActiveItemChange
}: MenuLevelProps) {
  const [openSubMenuId, setOpenSubMenuId] = useState<number | null>(null)

  useEffect(() => {
    if (forceClose) setOpenSubMenuId(null)
  }, [forceClose])

  const openFlyout = (index: number) => {
    setOpenSubMenuId(prev => {
      const next = prev === index ? null : index
      onActiveItemChange?.(next)
      return next
    })
  }

  const closeFlyout = () => {
    setOpenSubMenuId(null)
    onActiveItemChange?.(null)
    onLevelClose?.()
  }

  const handleLeafClick = (item: MenuItem) => {
    item.onClick?.()
    onMenuItemClick?.()
  }

  return (
    <div className={'MenuLevel'}>
      {items.map((item, index) => {
        const isActive = activeItemId === index || openSubMenuId === index
        const hasFlyout = Boolean(item?.subMenu?.length || item?.content)

        if (item?.disabled) {
          return (
            <div
              key={index}
              onClick={() => onMenuItemClick?.()}
              className={'MenuLevel__Item MenuLevel__Item--Disabled'}
            >
              <span>{item.label}</span>
            </div>
          )
        }

        if (item?.link) {
          return (
            <Link
              key={index}
              href={item.link}
              w={'100%'}
              textDecoration={'none'}
              _hover={{ textDecoration: 'none' }}
              onClick={() => onMenuItemClick?.()}
              className={`MenuLevel__Item ${isActive ? 'MenuLevel__Item--Active' : ''}`}
            >
              <span>{item.label}</span>
            </Link>
          )
        }

        if (hasFlyout) {
          const open = openSubMenuId === index
          return (
            <div key={index} className={'MenuLevel__ItemWrap'}>
              <div
                className={`MenuLevel__Item MenuLevel__Item--Submenu ${open ? 'MenuLevel__Item--Active' : ''}`}
                onClick={() => openFlyout(index)}
                role='button'
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openFlyout(index)
                  }
                }}
              >
                <span>{item.label}</span>
                <div className={'MenuLevel__ItemIcon'}>
                  <ChevronIcon />
                </div>
              </div>
              {open && (
                <div className={'MenuLevel__Flyout'}>
                  {item.subMenu
                    ? (
                      <MenuLevel
                        items={item.subMenu}
                        onMenuItemClick={onMenuItemClick}
                        onLevelClose={closeFlyout}
                        forceClose={forceClose}
                      />
                      )
                    : item.content}
                </div>
              )}
            </div>
          )
        }

        return (
          <div
            key={index}
            className={`MenuLevel__Item ${isActive ? 'MenuLevel__Item--Active' : ''}`}
            onClick={() => handleLeafClick(item)}
          >
            <span>{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}

export default MenuLevel
