'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import NavDropdown from './NavDropdown'
import './NavItem.scss'

const NavItem = ({ item, className = '' }) => {
  const pathname = usePathname()
  const isActive = pathname === item?.href

  return item?.submenuItems?.length
    ? <NavDropdown item={item}/>
    : <Link
        href={item.href}
        className={`NavItem ${isActive ? 'NavItem--Active' : ''} ${className}`}
      >
        {item.title}
      </Link>
}

export default NavItem
