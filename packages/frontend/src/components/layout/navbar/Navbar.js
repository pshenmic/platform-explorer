'use client'

import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons'
import GlobalSearchInput from '../../search/GlobalSearchInput'
import Link from 'next/link'
import { Box, Flex, HStack, IconButton, useDisclosure, Stack, useOutsideClick } from '@chakra-ui/react'
import { Breadcrumbs, breadcrumbsActiveRoutes } from '../../breadcrumbs/Breadcrumbs'
import NetworkSelect from './NetworkSelect'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useRef, useMemo } from 'react'
import { SearchResultsList } from '../../search'
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

const defaultSearchState = {
  results: { data: {}, loading: false, error: false },
  focused: false,
  value: ''
}

function Navbar () {
  const pathname = usePathname()
  const displayBreadcrumbs = useMemo(
    () => breadcrumbsActiveRoutes.some(route => pathname.indexOf(route) !== -1),
    [pathname]
  )

  const {
    isOpen: isMobileMenuOpen,
    onOpen: openMobileMenu,
    onClose: closeMobileMenu
  } = useDisclosure()

  const [searchState, setSearchState] = useState(defaultSearchState)

  const searchResultIsDisplay = searchState.focused &&
    (Object.entries(searchState.results.data || {})?.length || searchState.results.loading || searchState.results.error)

  const searchContainerRef = useRef(null)
  const mobileMenuRef = useRef(null)
  const searchTransitionTime = 1

  const hideSearch = () => setSearchState(defaultSearchState)

  useOutsideClick({ ref: searchContainerRef, handler: hideSearch })
  useOutsideClick({ ref: mobileMenuRef, handler: closeMobileMenu })

  useEffect(() => {
    closeMobileMenu()
    hideSearch()
  }, [pathname, closeMobileMenu])

  useEffect(() => {
    if (!searchState.focused) {
      setSearchState(prevState => ({
        ...prevState,
        results: { data: {}, loading: false, error: false }
      }))
    }
  }, [searchState.focused])

  const handleMobileMenuToggle = (e) => {
    e.stopPropagation()
    if (isMobileMenuOpen) {
      closeMobileMenu()
      return
    }
    openMobileMenu()
    if (searchState.focused) hideSearch()
  }

  return (
    <Box position={'relative'}>
      <div className={'NavbarStub'}></div>

      <Flex
        className={'Navbar'}
        maxW={'container.maxPageW'}
      >
        <div className={'Navbar__Left'}>
          <IconButton
            className={'Navbar__Burger'}
            size={'md'}
            icon={isMobileMenuOpen ? <CloseIcon/> : <HamburgerIcon/>}
            visibility={searchState.focused ? 'hidden' : 'visible'}
            w={searchState.focused ? '0' : '40px'}
            minW={0}
            aria-label={'Open Menu'}
            display={{ lg: 'none' }}
            onClick={handleMobileMenuToggle}
          />

          <HStack
            className={'Navbar__Menu'}
            as={'nav'}
            spacing={3}
            display={{ base: 'none', lg: 'flex' }}
            style={{
              visibility: searchState.focused ? 'hidden' : 'visible',
              opacity: searchState.focused ? 0 : 1,
              transition: `${searchTransitionTime / 2}s`,
              width: searchState.focused ? '0' : '100%',
              transitionDelay: searchState.focused ? '0s' : `${searchTransitionTime / 2}s`
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
            gap: searchState.focused ? 0 : '0.5rem',
            transition: `gap ${searchTransitionTime / 4}s`
          }}
        >
          <div
            className={'Navbar__NetworkSelectContainer'}
            style={{
              visibility: searchState.focused ? 'hidden' : 'visible',
              opacity: searchState.focused ? 0 : 1,
              transition: `${searchTransitionTime / 4}s`,
              transitionDelay: searchState.focused ? '0s' : `${searchTransitionTime}s`,
              alignItems: searchState.focused ? 'baseline' : 'center',
              ...(searchState.focused && { width: 0 })
            }}
          >
            <NetworkSelect/>
          </div>

          <div
            className={'Navbar__SearchContainer'}
            ref={searchContainerRef}
            onClick={() => setSearchState(prevState => ({ ...prevState, focused: true }))}
            style={{
              ...(searchState.focused && { width: '100%' }),
              transition: `${searchTransitionTime}s`,
              flexWrap: searchState.focused ? 'wrap' : 'nowrap'
            }}
          >
            <div
              className={'Navbar__SearchInputContainer'}
              style={{ transition: `width ${searchTransitionTime}s` }}
            >
              <GlobalSearchInput
                forceValue={searchState.value}
                onResultChange={results => setSearchState(prevState => ({ ...prevState, results }))}
                onChange={value => setSearchState(prevState => ({ ...prevState, value }))}
                navigateToFirstResult={true}
                onFocusChange={isFocused => setSearchState(prevState => ({ ...prevState, focused: !!isFocused }))}
              />
            </div>

            <div
              className={'Navbar__SearchResults'}
              style={{
                width: searchState.focused ? '100%' : 0,
                visibility: searchState.focused ? 'visible' : 'hidden',
                height: searchState.focused ? 'auto' : 0,
                opacity: searchState.focused ? 1 : 0,
                marginTop: searchResultIsDisplay ? '1rem' : 0,
                marginBottom: searchResultIsDisplay ? '0.25rem' : 0,
                padding: searchResultIsDisplay ? '0 0.75rem' : 0
              }}
            >
              <SearchResultsList results={searchState.results}/>
            </div>
          </div>
        </div>
      </Flex>

      <Box
        ref={mobileMenuRef}
        className={`NavbarMobileMenu ${isMobileMenuOpen && !searchState.focused ? 'NavbarMobileMenu--Open' : ''}`}
        display={{ lg: 'none' }}
      >
        <Stack className={'NavbarMobileMenu__Items'} as={'nav'}>
          {links.map((link) => (
            <NavLink
              className={'NavbarMobileMenu__Item'}
              to={link.href}
              isActive={pathname === link.href}
              key={link.title}
            >
              {link.title}
            </NavLink>
          ))}
        </Stack>
      </Box>
      {displayBreadcrumbs && <Breadcrumbs/>}
    </Box>
  )
}

export default Navbar
