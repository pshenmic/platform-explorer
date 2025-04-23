'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useMediaQuery } from '@chakra-ui/react'
import { usePathname } from 'next/navigation'
import MultiLevelMenu from '../../ui/menus/MultiLevelMenu'
import { ArrowButton } from '../../ui/Buttons'
import './NavItemDropdown.scss'

const NavDropdown = ({ title, href, submenuItems }) => {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href)
  const [isHoverable] = useMediaQuery('(hover: hover) and (pointer: fine)')
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef(null)

  const menuData = submenuItems.map(item => ({
    label: item.title,
    link: item.disabled ? undefined : item.href,
    onClick: item.disabled ? (e) => e.preventDefault() : undefined,
    className: item.disabled ? 'NavDropdown__Item--Disabled' : ''
  }))

  // Hover behavior with delay
  const handleMouseEnter = () => {
    if (!isHoverable) return

    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true)
    }, 200)
  }

  const handleMouseLeave = () => {
    if (!isHoverable) return

    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 200)
  }

  // Click behavior
  const handleClick = (e) => {
    if (!isHoverable || !isOpen) {
      e.preventDefault()
      setIsOpen(!isOpen)
    }
    // On desktop with open dropdown, allows navigation to href
  }

  const trigger = (
    <Link
      href={href}
      className={`NavItem ${isActive ? 'NavItem--Active' : ''} NavItem--WithDropdown`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      display={'flex'}
      alignItems={'center'}
    >
      {title}
      <ArrowButton className={`NavDropdownArrow ${isOpen ? 'NavDropdownArrow--Open' : ''}`}/>
    </Link>
  )

  return (
    <div
      className='NavDropdown'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <MultiLevelMenu
        menuData={menuData}
        trigger={trigger}
        placement='bottom-start'
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onOpen={() => setIsOpen(true)}
      />
    </div>
  )
}

export default NavDropdown
