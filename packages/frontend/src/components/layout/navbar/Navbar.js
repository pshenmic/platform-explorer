'use client'

import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons'
import GlobalSearchInput from '../../search/GlobalSearchInput'
import { Box, Flex, HStack, IconButton, useDisclosure, useOutsideClick, useBreakpointValue } from '@chakra-ui/react'
import { Breadcrumbs, breadcrumbsActiveRoutes } from '../../breadcrumbs/Breadcrumbs'
import NetworkSelect from './NetworkSelect'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useRef, useMemo } from 'react'
import { SearchResultsList } from '../../search'
import NavItem from './NavItem'
import NavbarMobileMenu from './NavbarMobileMenu'
import './Navbar.scss'

const menuItems = [
  { title: 'Home', href: '/' },
  {
    title: 'Blockchain',
    submenuItems: [
      { title: 'Blocks', href: '/blocks' },
      { title: 'Transactions', href: '/transactions' }
    ]
  },
  { title: 'Tokens', href: '/tokens' },
  { title: 'Data Contracts', href: '/dataContracts' },
  {
    title: 'Contested Resources',
    href: '/contestedResources',
    breakpoints: { base: true, sm: true, md: true, lg: false, xl: true, '2xl': true, '3xl': true },
    submenuItems: [
      { title: 'Contested Resources list', href: '/contestedResources' },
      { title: 'Masternode votes', href: '/masternodeVotes' }
    ]
  },
  { title: 'Identities', href: '/identities' },
  {
    title: 'Validators',
    href: '/validators',
    breakpoints: { base: true, sm: true, md: true, lg: true, xl: false, '2xl': true, '3xl': true }
  },
  {
    title: 'API',
    href: '/api',
    breakpoints: { base: true, sm: true, md: true, lg: false, xl: false, '2xl': true, '3xl': true }
  },
  {
    title: 'more',
    breakpoints: { base: false, sm: false, md: false, lg: true, xl: true, '2xl': false, '3xl': false },
    submenuItems: [
      {
        title: 'Contested Resources',
        href: '/contestedResources',
        breakpoints: { base: true, sm: false, md: true, lg: true, xl: false, '2xl': false, '3xl': false }
      },
      {
        title: 'Masternode votes',
        href: '/masternodeVotes',
        breakpoints: { base: true, sm: true, md: true, lg: true, xl: false, '2xl': false, '3xl': false }
      },
      {
        title: 'Validators',
        href: '/validators',
        breakpoints: { base: true, sm: false, md: false, lg: false, xl: true, '2xl': true, '3xl': true }
      },
      {
        title: 'API',
        href: '/api',
        breakpoints: { base: false, sm: false, md: false, lg: true, xl: true, '2xl': true, '3xl': true }
      }
    ]
  }
]

const defaultBreakpoints = { base: true, sm: true, md: true, lg: true, xl: true, '2xl': true, '3xl': true }

// Filter submenuItems by breakpoints
const filterSubmenuItems = (submenuItems, currentBreakpoint) => {
  if (!submenuItems) return submenuItems

  return submenuItems.filter(subItem => {
    const breakpoints = subItem.breakpoints || defaultBreakpoints
    return breakpoints[currentBreakpoint]
  })
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

  const currentBreakpoint = useBreakpointValue({
    base: 'base',
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
    '2xl': '2xl',
    '3xl': '3xl'
  }) || 'base'

  const visibleMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      const breakpoints = item.breakpoints || defaultBreakpoints
      return breakpoints[currentBreakpoint]
    }).map(item => ({
      ...item,
      submenuItems: filterSubmenuItems(item.submenuItems, currentBreakpoint)
    }))
  }, [currentBreakpoint])

  const mobileMenuItems = useMemo(() => {
    const isMobileBreakpoint = ['base', 'sm', 'md'].includes(currentBreakpoint)

    return menuItems.filter(item => {
      const breakpoints = item.breakpoints || defaultBreakpoints
      return isMobileBreakpoint ? breakpoints[currentBreakpoint] : breakpoints.base
    }).map(item => ({
      ...item,
      submenuItems: filterSubmenuItems(item.submenuItems, isMobileBreakpoint ? currentBreakpoint : 'base')
    }))
  }, [currentBreakpoint])

  const searchResultIsDisplay = searchState.focused &&
    (Object.entries(searchState.results.data || {})?.length || searchState.results.loading || searchState.results.error)

  const searchContainerRef = useRef(null)
  const searchTransitionTime = useBreakpointValue({ base: 0.2, md: 0.1 })
  const burgerRef = useRef(null)

  const hideSearch = () => setSearchState(defaultSearchState)

  useOutsideClick({
    ref: searchContainerRef,
    handler: () => {
      if (searchState?.focused) hideSearch()
    }
  })

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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        hideSearch()
        closeMobileMenu()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [closeMobileMenu])

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
        maxW={'container.maxNavigationW'}
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
            ref={burgerRef}
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
            {visibleMenuItems.map((menuItem) => (
              <NavItem key={menuItem.title} item={menuItem}/>
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

      <NavbarMobileMenu
        items={mobileMenuItems}
        isOpen={isMobileMenuOpen && !searchState.focused}
        onClose={closeMobileMenu}
        burgerRef={burgerRef}
      />

      {displayBreadcrumbs && <Breadcrumbs/>}
    </Box>
  )
}

export default Navbar
