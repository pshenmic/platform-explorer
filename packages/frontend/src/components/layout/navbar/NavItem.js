'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import NavDropdown from './NavDropdown'
import './NavItem.scss'

const NavItem = ({ link, className = '' }) => {
  const pathname = usePathname()
  const isActive = pathname === link.href

  console.log('link')

  return link.submenuItems?.length
    ? <NavDropdown
        title={link.title}
        href={link.href}
        submenuItems={link.submenuItems}
      />
    : <Link
        href={link.href}
        className={`NavItem ${isActive ? 'NavItem--Active' : ''} ${className}`}
      >
        {link.title}
      </Link>
}

export default NavItem
