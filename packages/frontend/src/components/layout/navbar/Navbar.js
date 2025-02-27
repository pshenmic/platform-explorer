'use client'

import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons'
import GlobalSearchInput from '../../search/GlobalSearchInput'
import Link from 'next/link'
import {
  Box,
  Flex,
  HStack,
  IconButton,
  useDisclosure,
  Stack
} from '@chakra-ui/react'
import Breadcrumbs from '../../breadcrumbs/Breadcrumbs'
import NetworkSelect from './NetworkSelect'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import './Navbar.scss'
import './NavbarMobileMenu.scss'
import './NavLink.scss'

const links = [
  { title: 'Home', href: '/' },
  { title: 'Blocks', href: '/blocks' },
  { title: 'Transactions', href: '/transactions' },
  { title: 'Data Contracts', href: '/dataContracts' },
  { title: 'Identities', href: '/identities' },
  { title: 'Validators', href: '/validators' },
  { title: 'API', href: '/api' }
]

const NavLink = ({ children, to, isActive, className }) => {
  return (
    <Link
      href={to}
      className={`NavLink ${isActive ? 'NavLink--Active' : ''} ${className || ''}`}
    >
      {children}
    </Link>
  )
}

function Navbar () {
  const pathname = usePathname()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const breadcrumbsActiveRoutes = [
    '/validator/',
    '/transaction/',
    '/identity/',
    '/dataContract/',
    '/document/',
    '/block/'
  ]
  const displayBreadcrumbs = breadcrumbsActiveRoutes.some(route => pathname.indexOf(route) !== -1)

  const [searchFocused, setSearchFocused] = useState(false)

  useEffect(onClose, [pathname, onClose])

  return (
    <Box position={'relative'}>
      <div className={'NavbarStub'}></div>
      <Flex
        className={'Navbar'}
        maxW={'container.maxPageW'}
        ml={'auto'}
        mr={'auto'}
        h={searchFocused ? 100 : 16}
        gap={'8px'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <IconButton
          className={'Navbar__Burger'}
          size={'md'}
          icon={isOpen ? <CloseIcon/> : <HamburgerIcon/>}
          aria-label={'Open Menu'}
          display={{ lg: 'none' }}
          onClick={isOpen ? onClose : onOpen}
        />

        <HStack className={'Navbar__Menu'} as={'nav'} spacing={3} display={{ base: 'none', lg: 'flex' }}>
          {links.map((link) => (
            <NavLink to={link.href} key={link.title} isActive={pathname === link.href}>{link.title}</NavLink>
          ))}
        </HStack>

        <div className={'Navbar__WrapperNetworkSelect'}>
          <div
            style={{
              visibility: searchFocused ? 'hidden' : 'visible',
              opacity: searchFocused ? 0 : 1,
              transition: '.5s'
            }}
          >
            <NetworkSelect/>
          </div>

          <Box
            ml={2}
            zIndex={20}
            onClick={() => setSearchFocused(state => !state)}

            style={{
              position: searchFocused ? 'absolute' : 'relative',
              height: searchFocused ? '10px' : '20px',
              width: searchFocused ? '1000px' : '250px',
              maxWidth: '100%',
              zIndex: 20,
              right: 0,
              transition: '.5s'
            }}
          >
            <GlobalSearchInput />
          </Box>
        </div>
      </Flex>

      <Box className={`NavbarMobileMenu ${isOpen ? 'NavbarMobileMenu--Open' : ''}`} display={{ lg: 'none' }}>
        <Stack className={'NavbarMobileMenu__Items'} as={'nav'}>
          {links.map((link) => (
            <NavLink className={'NavbarMobileMenu__Item'} to={link.href} key={link.title} isActive={pathname === link.href}>{link.title}</NavLink>
          ))}
        </Stack>
      </Box>
      {displayBreadcrumbs && <Breadcrumbs/>}
    </Box>
  )
}

export default Navbar
