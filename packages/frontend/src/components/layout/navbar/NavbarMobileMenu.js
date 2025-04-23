'use client'

import { useState, useEffect, useRef } from 'react'
import { Box, Stack, Flex, Fade, useOutsideClick } from '@chakra-ui/react'
import { ChevronIcon } from '../../ui/icons'
import { usePathname } from 'next/navigation'
import { ArrowButton } from '../../ui/Buttons'
import Link from 'next/link'
import { SmoothSize } from '../../ui/containers'
import './NavbarMobileMenu.scss'

const NavbarMobileMenu = ({ items, isOpen, onClose, burgerRef }) => {
  const pathname = usePathname()
  const [activeSubmenu, setActiveSubmenu] = useState(null)
  const [renderMain, setRenderMain] = useState(true)
  const [renderSubmenu, setRenderSubmenu] = useState(false)
  const mobileMenuRef = useRef(null)

  useOutsideClick({
    ref: mobileMenuRef,
    handler: e => {
      if (burgerRef?.current && !burgerRef.current.contains(e.target)) {
        onClose()
      }
    }
  })

  useEffect(() => {
    setRenderMain(!activeSubmenu)
    setRenderSubmenu(!!activeSubmenu)
  }, [activeSubmenu])

  useEffect(() => {
    if (isOpen) {
      setActiveSubmenu(null)
    }
  }, [isOpen, pathname])

  const handleItemClick = (item) => {
    if (item.submenuItems?.length) {
      setActiveSubmenu(item)
    } else {
      onClose()
    }
  }

  const goToMainMenu = () => {
    setActiveSubmenu(null)
  }

  return (
    <Box
      className={`NavbarMobileMenu ${isOpen ? 'NavbarMobileMenu--Open' : ''}`}
      display={{ lg: 'none' }}
      ref={mobileMenuRef}
    >
      <SmoothSize duration={0.1}>
      {renderMain && (
        <Fade className={'NavbarMobileMenu__Content'} in={!activeSubmenu} unmountOnExit>
          <Stack className={'NavbarMobileMenu__Items'} as={'nav'}>
            {items.map((item) => (
              <Flex
                key={item.title}
                className={`NavbarMobileMenu__Item ${pathname === item.href ? 'NavbarMobileMenu__Item--Active' : ''}`}
                onClick={() => handleItemClick(item)}
                as={item.submenuItems?.length ? 'div' : Link}
                href={item.submenuItems?.length ? undefined : item.href}
                justifyContent={'space-between'}
                alignItems={'center'}
              >
                <span>{item.title}</span>
                {item.submenuItems?.length && (
                  <div className={'NavbarMobileMenu__ItemIcon'}>
                    <ArrowButton/>
                  </div>
                )}
              </Flex>
            ))}
          </Stack>
        </Fade>
      )}

      {renderSubmenu && activeSubmenu && (
        <Fade className={'NavbarMobileMenu__Content'} in={!!activeSubmenu} unmountOnExit>
          <div className={'NavbarMobileMenu__Header'}>
            <Flex
              className={'NavbarMobileMenu__BackButton'}
              onClick={goToMainMenu}
            >
              <ChevronIcon transform={'rotate(180deg)'}/>
            </Flex>

            <div className={'NavbarMobileMenu__Title'}>
              {activeSubmenu?.title}
            </div>
          </div>

          <Stack className={'NavbarMobileMenu__Items'} as={'nav'}>
            {activeSubmenu.submenuItems.map((subItem) => (
              <Link
                key={subItem.title}
                href={subItem.disabled ? '#' : subItem.href}
                className={`NavbarMobileMenu__Item ${pathname === subItem.href ? 'NavbarMobileMenu__Item--Active' : ''} ${subItem.disabled ? 'NavbarMobileMenu__Item--Disabled' : ''}`}
                onClick={(e) => {
                  if (subItem.disabled) {
                    e.preventDefault()
                    return
                  }
                  onClose()
                }}
              >
                {subItem.title}
              </Link>
            ))}
          </Stack>
        </Fade>
      )}
      </SmoothSize>
    </Box>
  )
}

export default NavbarMobileMenu
