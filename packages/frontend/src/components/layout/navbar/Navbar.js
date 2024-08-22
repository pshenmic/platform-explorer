'use client'

import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons'
import GlobalSearchInput from '../../search/GlobalSearchInput'
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

const NavLink = ({ children, to, isActive }) => {
  return (
    <Box
      as={'a'}
      px={2}
      py={1}
      href={to}
      whiteSpace={'nowrap'}
      className={`NavLink ${isActive ? 'NavLink--Active' : ''}`}
    >
      {children}
    </Box>
  )
}

function Navbar () {
  const pathname = usePathname()
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Box px={3}>
      <Flex
        className={'Navbar'}
        maxW={'1980px'}
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

        <HStack spacing={8} alignItems={'center'}>
          <HStack as={'nav'} spacing={3} display={{ base: 'none', lg: 'flex' }}>
            {links.map((link) => (
              <NavLink to={link.href} key={link.title} isActive={pathname === link.href}>{link.title}</NavLink>
            ))}
          </HStack>
        </HStack>

        <div className={'Navbar__WrapperNetworkSelect'}>
          <NetworkSelect />
          <Box ml={2}>
            <GlobalSearchInput />
          </Box>
        </div>

        {isOpen
          ? <Box className={'NavbarMobileMenu'} pb={4} display={{ lg: 'none' }}>
              <Stack as={'nav'} spacing={4}>
                {links.map((link) => (
                  <NavLink to={link.href} key={link.title} isActive={pathname === link.href}>{link.title}</NavLink>
                ))}
              </Stack>
            </Box>
          : null}
      </Flex>
    </Box>
  )
}

export default Navbar
