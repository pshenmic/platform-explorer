'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import NavDropdown from './NavDropdown'
import './NavLink.scss'

const NavLink = ({ link, className = '' }) => {
  const pathname = usePathname()
  const isActive = pathname === link.href

  return link.submenuItems?.length
    ? <NavDropdown
        title={link.title}
        href={link.href}
        submenuItems={link.submenuItems}
      />
    : <Link
        href={link.href}
        className={`NavLink ${isActive ? 'NavLink--Active' : ''} ${className}`}
      >
        {link.title}
      </Link>
}

export default NavLink
