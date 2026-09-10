'use client'

import type { ReactNode } from 'react'
import NextLink from 'next/link'
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
  /** Selected row index — owned by MultiLevelMenu only */
  selectedIndex?: number | null
  onSelectIndex?: (index: number) => void
}

/**
 * Flat menu list. No nested Popovers, no parent setState during render.
 * Items with content/subMenu ask the parent to show a side panel via onSelectIndex.
 */
function MenuLevel({
  items = [],
  onMenuItemClick,
  selectedIndex = null,
  onSelectIndex
}: MenuLevelProps) {
  return (
    <div className={'MenuLevel'}>
      {items.map((item, index) => {
        const isSelected = selectedIndex === index
        const opensPanel = Boolean(item.content || item.subMenu?.length)

        if (item.disabled) {
          return (
            <div key={index} className={'MenuLevel__Item MenuLevel__Item--Disabled'}>
              <span>{item.label}</span>
            </div>
          )
        }

        if (item.link) {
          return (
            <NextLink
              key={index}
              href={item.link}
              onClick={() => onMenuItemClick?.()}
              className={`MenuLevel__Item ${isSelected ? 'MenuLevel__Item--Active' : ''}`}
              style={{ width: '100%', textDecoration: 'none' }}
            >
              <span>{item.label}</span>
            </NextLink>
          )
        }

        if (opensPanel) {
          return (
            <div
              key={index}
              role="button"
              tabIndex={0}
              className={`MenuLevel__Item MenuLevel__Item--Submenu ${isSelected ? 'MenuLevel__Item--Active' : ''}`}
              onClick={() => onSelectIndex?.(index)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelectIndex?.(index)
                }
              }}
            >
              <span>{item.label}</span>
              <span className={'MenuLevel__ItemChevron'} aria-hidden>
                ›
              </span>
            </div>
          )
        }

        return (
          <div
            key={index}
            className={`MenuLevel__Item ${isSelected ? 'MenuLevel__Item--Active' : ''}`}
            onClick={() => {
              item.onClick?.()
              onMenuItemClick?.()
            }}
          >
            <span>{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}

export default MenuLevel
