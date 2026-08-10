'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { WithClassName } from '../../../types/common'
import NavDropdown from './NavDropdown'
import type { NavMenuItem } from './types'
import './NavItem.scss'

interface NavItemProps extends WithClassName {
  item: NavMenuItem
}

const NavItem = ({ item, className = '' }: NavItemProps) => {
  const pathname = usePathname()
  const isActive = pathname === item?.href

  return item?.submenuItems?.length
    ? <NavDropdown item={item}/>
    : <Link
        href={item.href ?? '#'}
        className={`NavItem ${isActive ? 'NavItem--Active' : ''} ${className}`}
      >
        {item.title}
      </Link>
}

export default NavItem
