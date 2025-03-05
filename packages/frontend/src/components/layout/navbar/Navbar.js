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
  // const [searchFocusedd, setSearchFocused] = useState(false)
  // const searchFocused = true
  const [searchResults, setSearchResults] = useState({ data: mockSearchResults, loading: false, error: false })

  useEffect(onClose, [pathname, onClose])

  useEffect(onClose, [pathname])

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
        gap={searchFocused ? 0 : '0.5rem'}
        alignItems={'center'}
        justifyContent={'space-between'}
        style={{
          gap: 0
        }}
        onClick={() => setSearchFocused(state => !state)}
      >
        <div
          className={'Navbar__Left'}
          style={{
            width: 0
          }}
        >
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
            display={{
              base: 'none',
              lg: 'flex'
            }}
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
            position: 'relative',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            width: '100%',
            gap: '0.5rem',
            zIndex: -1
          }}
        >

         <div
            className={'Navbar__NetworkSelectContainer'}
            style={{
              visibility: searchFocused ? 'hidden' : 'visible',
              opacity: searchFocused ? 0 : 1,
              ...(searchFocused && { width: 0 }),
              flexShrink: 0,
              marginLeft: 'auto',
              transition: '.2s',
              transitionDelay: searchFocused ? '0s' : '1s',
              alignItems: searchFocused ? 'baseline' : 'center'
            }}
         >
          <NetworkSelect/>
         </div>

        <div
          className={'Navbar__SearchContainer'}
          style={{
            position: 'relative',
            margin: 0,
            ...(searchFocused && { width: '100%' }),
            gap: 0,
            transition: '1s',
            display: 'flex',
            alignItems: 'center',
            flexWrap: searchFocused ? 'wrap' : 'nowrap'
          }}
        >

          <div
            className={'Navbar__SearchStub'}
            style={{
              height: '40px',
              width: searchFocused ? '100%' : 'auto'
            }}
          />

          <div
            style={{
              position: searchFocused ? 'absolute' : 'relative',
              width: '1440px',
              maxWidth: '100%',
              zIndex: 20,
              right: 0,
              top: 0,
              transition: 'width 1s'
            }}
          >
            {/* <GlobalSearchInput onResultChange={setSearchResults} onFocusChange={setSearchFocused}/> */}
            <GlobalSearchInput
              onResultChange={setSearchResults}
              // onFocusChange={setSearchFocused}
            />
          </div>

          <div
            style={{
              // position: searchFocused ? 'relative' : 'absolute',
              // marginTop: '4rem',
              width: searchFocused ? '100%' : 0,
              visibility: searchFocused ? 'visible' : 'hidden',
              height: searchFocused ? 'auto' : 0,
              opacity: searchFocused ? 1 : 0,
              // transition: !searchFocused ? 0 : '.5s',
              // paddingBottom: '18px',
              maxHeight: 'calc(100vh - 10rem)',
              position: 'relative',
              overflowY: 'auto',
              marginTop: Object.entries(searchResults.data)?.length ? '1rem' : 0
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
