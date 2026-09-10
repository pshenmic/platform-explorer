'use client'

import { useOutsideClick } from '../../../hooks/useOutsideClick'
import { useState, useEffect, useRef } from 'react'
import type { RefObject, MouseEvent as ReactMouseEvent } from 'react'
import { Box, Stack, Flex, Fade } from '@chakra-ui/react'
import { ChevronIcon } from '../../ui/icons'
import { usePathname } from 'next/navigation'
import { ArrowButton } from '../../ui/Buttons'
import Link from 'next/link'
import { SmoothSize } from '../../ui/containers'
import type { NavMenuItem } from './types'
import './NavbarMobileMenu.scss'

interface NavbarMobileMenuProps {
  items: NavMenuItem[]
  isOpen: boolean
  onClose: () => void
  burgerRef?: RefObject<HTMLElement | null>
}

const NavbarMobileMenu = ({ items, isOpen, onClose, burgerRef }: NavbarMobileMenuProps) => {
  const pathname = usePathname()
  const [activeSubmenu, setActiveSubmenu] = useState<NavMenuItem | null>(null)
  const [renderMain, setRenderMain] = useState(true)
  const [renderSubmenu, setRenderSubmenu] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement | null>(null)

  useOutsideClick({
    ref: mobileMenuRef,
    handler: (e: Event) => {
      const target = e.target as Node
      if (burgerRef?.current && !burgerRef.current.contains(target)) {
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

  const handleItemClick = (item: NavMenuItem) => {
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
            {items.map((item) => {
              const hasSubmenu = Boolean(item.submenuItems?.length)
              const itemClassName = `NavbarMobileMenu__Item ${pathname === item.href ? 'NavbarMobileMenu__Item--Active' : ''}`

              if (hasSubmenu) {
                return (
                  <Flex
                    key={item.title}
                    className={itemClassName}
                    onClick={() => handleItemClick(item)}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                  >
                    <span>{item.title}</span>
                    <div className={'NavbarMobileMenu__ItemIcon'}>
                      <ArrowButton/>
                    </div>
                  </Flex>
                )
              }

              return (
                <Flex
                  key={item.title}
                  className={itemClassName}
                  onClick={() => handleItemClick(item)}
                  as={Link}
                  href={item.href ?? '#'}
                  justifyContent={'space-between'}
                  alignItems={'center'}
                >
                  <span>{item.title}</span>
                </Flex>
              )
            })}
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
            {activeSubmenu.submenuItems?.map((subItem) => (
              <Link
                key={subItem.title}
                href={subItem.disabled ? '#' : (subItem.href ?? '#')}
                className={`NavbarMobileMenu__Item ${pathname === subItem.href ? 'NavbarMobileMenu__Item--Active' : ''} ${subItem.disabled ? 'NavbarMobileMenu__Item--Disabled' : ''}`}
                onClick={(e: ReactMouseEvent) => {
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
