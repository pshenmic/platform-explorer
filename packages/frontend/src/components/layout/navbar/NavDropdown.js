'use client'

import { useRef, useState } from 'react'
import { useMediaQuery } from '@chakra-ui/react'
import { usePathname } from 'next/navigation'
import MultiLevelMenu from '../../ui/menus/MultiLevelMenu'
import { ArrowButton } from '../../ui/Buttons'
import './NavDropdown.scss'

const NavDropdown = ({ item }) => {
  const { title, href, submenuItems } = item
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href)
  const [isHoverable] = useMediaQuery('(hover: hover) and (pointer: fine)')
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef(null)

  const menuData = submenuItems.map(item => ({
    label: item.title,
    disabled: item?.disabled,
    link: item?.href
  }))

  const handleMouseEnter = () => {
    if (!isHoverable) return

    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true)
    }, 100)
  }

  const handleMouseLeave = () => {
    if (!isHoverable) return

    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 100)
  }

  const handleClick = (e) => {
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
      <ArrowButton className={`NavItem__DropdownIcon ${isOpen ? 'NavItem__DropdownIcon--Open' : ''}`}/>
    </div>
  )

  return (
    <div
      className={'NavDropdown'}
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
