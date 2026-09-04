'use client'

import { useState, useEffect, useRef } from 'react'
import type { RefObject, MouseEvent as ReactMouseEvent } from 'react'
import { ChevronIcon } from '../../ui/icons'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import '../../ui/Buttons/ArrowButton.css'
import { SmoothSize } from '../../ui/containers'
import type { NavMenuItem } from './types'
import './NavbarMobileMenu.css'

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

  useEffect(() => {
    if (!isOpen) return
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (mobileMenuRef.current?.contains(target)) return
      if (burgerRef?.current?.contains(target)) return
      onClose()
    }
    const id = window.setTimeout(() => {
      document.addEventListener('pointerdown', onPointerDown)
    }, 0)
    return () => {
      window.clearTimeout(id)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [isOpen, onClose, burgerRef])

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
    <div
      className={`NavbarMobileMenu ${isOpen ? 'NavbarMobileMenu--Open' : ''}`}
      ref={mobileMenuRef}
    >
      <SmoothSize duration={0.1}>
        {renderMain && (
          <div className={'NavbarMobileMenu__Content'}>
            <nav className={'NavbarMobileMenu__Items'}>
              {items.map(item => {
                const hasSubmenu = Boolean(item.submenuItems?.length)
                const itemClassName = `NavbarMobileMenu__Item ${pathname === item.href ? 'NavbarMobileMenu__Item--Active' : ''}`

                if (hasSubmenu) {
                  return (
                    <button
                      type={'button'}
                      key={item.title}
                      className={itemClassName}
                      onClick={() => handleItemClick(item)}
                    >
                      <span>{item.title}</span>
                      <span className={'NavbarMobileMenu__ItemIcon'} aria-hidden={'true'}>
                        <span className={'ArrowButton'}>
                          <ChevronIcon />
                        </span>
                      </span>
                    </button>
                  )
                }

                return (
                  <Link
                    key={item.title}
                    className={itemClassName}
                    onClick={() => handleItemClick(item)}
                    href={item.href ?? '#'}
                  >
                    <span>{item.title}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        )}

        {renderSubmenu && activeSubmenu && (
          <div className={'NavbarMobileMenu__Content'}>
            <div className={'NavbarMobileMenu__Header'}>
              <button
                type={'button'}
                className={'NavbarMobileMenu__BackButton'}
                onClick={goToMainMenu}
                aria-label={'Back'}
              >
                <ChevronIcon style={{ transform: 'rotate(180deg)' }} />
              </button>

              <div className={'NavbarMobileMenu__Title'}>{activeSubmenu?.title}</div>
            </div>

            <nav className={'NavbarMobileMenu__Items'}>
              {activeSubmenu.submenuItems?.map(subItem => (
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
            </nav>
          </div>
        )}
      </SmoothSize>
    </div>
  )
}

export default NavbarMobileMenu
