'use client'

import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { usePathname } from 'next/navigation'
import MultiLevelMenu from '../../ui/menus/MultiLevelMenu'
import { ArrowButton } from '../../ui/Buttons'
import type { NavMenuItem } from './types'
import './NavDropdown.css'

interface NavDropdownProps {
  item: NavMenuItem
}

const NavDropdown = ({ item }: NavDropdownProps) => {
  const { title, href, submenuItems } = item
  const pathname = usePathname()
  const isActive = pathname === href || (href != null && pathname.startsWith(href))
  const [isHoverable, setIsHoverable] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const update = () => setIsHoverable(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const menuData = (submenuItems ?? []).map(subItem => ({
    label: subItem.title,
    disabled: subItem?.disabled,
    link: subItem?.href
  }))

  const handleMouseEnter = () => {
    if (!isHoverable) return

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    if (!isHoverable) return

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 220)
  }

  const handleClick = (e: MouseEvent) => {
    if (!isHoverable || !isOpen) {
      e.preventDefault()
      setIsOpen(!isOpen)
    }
  }

  const trigger = (
    <div
      className={`NavItem ${isActive ? 'NavItem--Active' : ''} NavItem--WithDropdown`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {title}
      <ArrowButton
        className={`NavItem__DropdownIcon ${isOpen ? 'NavItem__DropdownIcon--Open' : ''}`}
      />
    </div>
  )

  return (
    <div className={'NavDropdown'} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <MultiLevelMenu
        menuData={menuData}
        trigger={trigger}
        placement="bottom-start"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onOpen={() => setIsOpen(true)}
        onContentMouseEnter={handleMouseEnter}
        onContentMouseLeave={handleMouseLeave}
      />
    </div>
  )
}

export default NavDropdown
