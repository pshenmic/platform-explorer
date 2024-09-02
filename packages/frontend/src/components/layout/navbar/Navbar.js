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
import NetworkSelect from './NetworkSelect'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
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

  useEffect(onClose, [pathname])

  return (
    <Box px={3} position={'relative'}>
      <div className={'NavbarStub'}></div>
      <Flex
        className={'Navbar'}
        maxW={'1440px'}
        ml={'auto'}
        mr={'auto'}
        h={16}
        gap={'8px'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <IconButton
          size={'md'}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
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
          <NetworkSelect/>
          <Box ml={2}>
            <GlobalSearchInput />
          </Box>
        </div>

        <Box className={`Navbar__MobileMenu NavbarMobileMenu ${isOpen ? 'NavbarMobileMenu--Open' : ''}`} display={{ lg: 'none' }}>
          <Stack className={'NavbarMobileMenu__Items'} as={'nav'}>
            {links.map((link) => (
              <NavLink className={'NavbarMobileMenu__Item'} to={link.href} key={link.title} isActive={pathname === link.href}>{link.title}</NavLink>
            ))}
          </Stack>
        </Box>
      </Flex>
    </Box>
  )
}

export default Navbar
