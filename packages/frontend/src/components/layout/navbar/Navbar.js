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
  Stack,
  useOutsideClick
} from '@chakra-ui/react'
import Breadcrumbs from '../../breadcrumbs/Breadcrumbs'
import NetworkSelect from './NetworkSelect'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { SearchResultsList } from '../../search'
import mockSearchResults from './mockSearchResults'
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
  const [searchResults, setSearchResults] = useState({ data: mockSearchResults, loading: false, error: false })
  const [searchValue, setSearchValue] = useState('')

  const ref = useRef(null)

  const hideSearch = () => {
    setSearchResults({ data: {}, loading: false, error: false })
    setSearchFocused(false)
    setSearchValue('')
  }

  useOutsideClick({ ref, handler: hideSearch })

  useEffect(onClose, [pathname, onClose])

  useEffect(hideSearch, [pathname])

  useEffect(() => {
    if (!searchFocused) {
      setSearchResults({ data: {}, loading: false, error: false })
    }
  }, [searchFocused])

  console.log('searchResults', searchResults)

  return (
    <Box position={'relative'}>
      <div className={'NavbarStub'}></div>

      <Flex
        className={'Navbar'}
        maxW={'container.maxPageW'}
        maxH={'100%'}
        ml={'auto'}
        mr={'auto'}
        minH={0}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <div className={'Navbar__Left'}>
          <IconButton
            className={'Navbar__Burger'}
            size={'md'}
            icon={isOpen ? <CloseIcon/> : <HamburgerIcon/>}
            visibility={searchFocused ? 'hidden' : 'visible'}
            w={searchFocused ? '0' : '40px'}
            minW={0}
            aria-label={'Open Menu'}
            display={{ lg: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />

          <HStack
            className={'Navbar__Menu'}
            as={'nav'}
            spacing={3}
            display={{ base: 'none', lg: 'flex' }}
            style={{
              visibility: searchFocused ? 'hidden' : 'visible',
              opacity: searchFocused ? 0 : 1,
              transition: '.5s',
              width: searchFocused ? '0' : '100%',
              transitionDelay: searchFocused ? '0s' : '0.5s'
            }}
          >
            {links.map((link) => (
              <NavLink to={link.href} key={link.title} isActive={pathname === link.href}>{link.title}</NavLink>
            ))}
          </HStack>
        </div>

        <div
          className={'Navbar__Right'}
          style={{
            gap: searchFocused ? 0 : '0.5rem',
            transition: 'gap .2s'
          }}
        >

         <div
            className={'Navbar__NetworkSelectContainer'}
            style={{
              visibility: searchFocused ? 'hidden' : 'visible',
              opacity: searchFocused ? 0 : 1,
              transition: '.2s',
              transitionDelay: searchFocused ? '0s' : '1s',
              alignItems: searchFocused ? 'baseline' : 'center',
              ...(searchFocused && { width: 0 })
            }}
         >
          <NetworkSelect/>
         </div>

        <div
          className={'Navbar__SearchContainer'}
          ref={ref}
          onClick={() => setSearchFocused(true)}
          style={{
            ...(searchFocused && { width: '100%' }),
            transition: '1s',
            flexWrap: searchFocused ? 'wrap' : 'nowrap'
          }}
        >
          <div
            className={'Navbar__SearchInputContainer'}
            style={{
              transition: 'width 1s'
            }}
          >
            <GlobalSearchInput
              forceValue={searchValue}
              onResultChange={setSearchResults}
              onChange={setSearchValue}
            />
          </div>

          <div
            className={'Navbar__SearchResults'}
            style={{
              width: searchFocused ? '100%' : 0,
              visibility: searchFocused ? 'visible' : 'hidden',
              height: searchFocused ? 'auto' : 0,
              opacity: searchFocused ? 1 : 0,
              marginTop: Object.entries(searchResults.data || {})?.length || searchResults.loading || searchResults.error ? '1rem' : 0
            }}
          >
            <SearchResultsList results={searchResults}/>
          </div>
        </div>
        </div>
      </Flex>

      <Box className={`NavbarMobileMenu ${isOpen && !searchFocused ? 'NavbarMobileMenu--Open' : ''}`}
           display={{ lg: 'none' }}>
        <Stack className={'NavbarMobileMenu__Items'} as={'nav'}>
          {links.map((link) => (
            <NavLink className={'NavbarMobileMenu__Item'} to={link.href} key={link.title}
                     isActive={pathname === link.href}>{link.title}</NavLink>
          ))}
        </Stack>
      </Box>
      {displayBreadcrumbs && <Breadcrumbs/>}
    </Box>
  )
}

export default Navbar
