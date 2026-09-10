'use client'

import { useOutsideClick } from '../../../hooks/useOutsideClick'
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons'
import GlobalSearchInput from '../../search/GlobalSearchInput'
import { Box, Flex, HStack, IconButton, useDisclosure, useBreakpointValue } from '@chakra-ui/react'
import { Breadcrumbs, breadcrumbsActiveRoutes } from '../../breadcrumbs/Breadcrumbs'
import NetworkSelect from './NetworkSelect'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useRef, useMemo } from 'react'
import type { MouseEvent } from 'react'
import { SearchResultsList } from '../../search'
import NavItem from './NavItem'
import NavbarMobileMenu from './NavbarMobileMenu'
import type { BreakpointKey, BreakpointVisibility, NavMenuItem } from './types'
import type { LoadableState } from '../../../types/common'
import type { SearchResultsData } from '../../search/SearchResultsList'
import './Navbar.css'

const menuItems: NavMenuItem[] = [
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
    title: 'Developers',
    submenuItems: [
      { title: 'API', href: '/api' },
      { title: 'Create Data Contract', href: '/dataContract/create' },
      { title: 'Create Token', href: '/tokens/create' },
      { title: 'Broadcast Transaction', href: '/developers/broadcast' }
    ]
  },
  {
    title: 'more',
    breakpoints: {
      base: false,
      sm: false,
      md: false,
      lg: true,
      xl: true,
      '2xl': false,
      '3xl': false
    },
    submenuItems: [
      {
        title: 'Contested Resources',
        href: '/contestedResources',
        breakpoints: {
          base: true,
          sm: false,
          md: true,
          lg: true,
          xl: false,
          '2xl': false,
          '3xl': false
        }
      },
      {
        title: 'Masternode votes',
        href: '/masternodeVotes',
        breakpoints: {
          base: true,
          sm: true,
          md: true,
          lg: true,
          xl: false,
          '2xl': false,
          '3xl': false
        }
      },
      {
        title: 'Validators',
        href: '/validators',
        breakpoints: {
          base: true,
          sm: false,
          md: false,
          lg: false,
          xl: true,
          '2xl': true,
          '3xl': true
        }
      }
    ]
  }
]

const defaultBreakpoints: BreakpointVisibility = {
  base: true,
  sm: true,
  md: true,
  lg: true,
  xl: true,
  '2xl': true,
  '3xl': true
}

// Filter submenuItems by breakpoints
const filterSubmenuItems = (
  submenuItems: NavMenuItem[] | undefined,
  currentBreakpoint: BreakpointKey
): NavMenuItem[] | undefined => {
  if (!submenuItems) return submenuItems

  return submenuItems.filter(subItem => {
    const breakpoints = { ...defaultBreakpoints, ...subItem.breakpoints }
    return breakpoints[currentBreakpoint]
  })
}

interface SearchState {
  results: LoadableState<SearchResultsData>
  focused: boolean
  value: string
}

const defaultSearchState: SearchState = {
  results: { data: {}, loading: false, error: false },
  focused: false,
  value: ''
}

function Navbar() {
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

  const [searchState, setSearchState] = useState<SearchState>(defaultSearchState)

  const currentBreakpoint = (useBreakpointValue({
    base: 'base',
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
    '2xl': '2xl',
    '3xl': '3xl'
  }) || 'base') as BreakpointKey

  const visibleMenuItems = useMemo(() => {
    return menuItems
      .filter(item => {
        const breakpoints = { ...defaultBreakpoints, ...item.breakpoints }
        return breakpoints[currentBreakpoint]
      })
      .map(item => ({
        ...item,
        submenuItems: filterSubmenuItems(item.submenuItems, currentBreakpoint)
      }))
  }, [currentBreakpoint])

  const mobileMenuItems = useMemo(() => {
    const isMobileBreakpoint = (['base', 'sm', 'md'] as BreakpointKey[]).includes(currentBreakpoint)

    return menuItems
      .filter(item => {
        const breakpoints = { ...defaultBreakpoints, ...item.breakpoints }
        return isMobileBreakpoint ? breakpoints[currentBreakpoint] : breakpoints.base
      })
      .map(item => ({
        ...item,
        submenuItems: filterSubmenuItems(
          item.submenuItems,
          isMobileBreakpoint ? currentBreakpoint : 'base'
        )
      }))
  }, [currentBreakpoint])

  const searchResultIsDisplay =
    searchState.focused &&
    (Object.entries(searchState.results.data || {})?.length ||
      searchState.results.loading ||
      searchState.results.error)

  const searchContainerRef = useRef<HTMLDivElement | null>(null)
  const searchTransitionTime = useBreakpointValue({ base: 0.2, md: 0.1 })
  const burgerRef = useRef<HTMLButtonElement | null>(null)

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
    const handleKeyDown = (e: KeyboardEvent) => {
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

  const handleMobileMenuToggle = (e: MouseEvent) => {
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

      <Flex className={'Navbar'} maxW={'container.maxNavigationW'}>
        <div className={'Navbar__Left'}>
          <IconButton
            className={'Navbar__Burger'}
            size={'md'}
            icon={isMobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
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
              transition: `${(searchTransitionTime ?? 0.1) / 2}s`,
              width: searchState.focused ? '0' : '100%',
              transitionDelay: searchState.focused ? '0s' : `${(searchTransitionTime ?? 0.1) / 2}s`
            }}
          >
            {visibleMenuItems.map(menuItem => (
              <NavItem key={menuItem.title} item={menuItem} />
            ))}
          </HStack>
        </div>

        <div
          className={'Navbar__Right'}
          style={{
            gap: searchState.focused ? 0 : '0.5rem',
            transition: `gap ${(searchTransitionTime ?? 0.1) / 4}s`
          }}
        >
          <div
            className={'Navbar__NetworkSelectContainer'}
            style={{
              visibility: searchState.focused ? 'hidden' : 'visible',
              opacity: searchState.focused ? 0 : 1,
              transition: `${(searchTransitionTime ?? 0.1) / 4}s`,
              transitionDelay: searchState.focused ? '0s' : `${searchTransitionTime ?? 0.1}s`,
              alignItems: searchState.focused ? 'baseline' : 'center',
              ...(searchState.focused && { width: 0 })
            }}
          >
            <NetworkSelect />
          </div>

          <div
            className={'Navbar__SearchContainer'}
            ref={searchContainerRef}
            onClick={() => setSearchState(prevState => ({ ...prevState, focused: true }))}
            style={{
              ...(searchState.focused && { width: '100%' }),
              transition: `${searchTransitionTime ?? 0.1}s`,
              flexWrap: searchState.focused ? 'wrap' : 'nowrap'
            }}
          >
            <div
              className={'Navbar__SearchInputContainer'}
              style={{ transition: `width ${searchTransitionTime ?? 0.1}s` }}
            >
              <GlobalSearchInput
                forceValue={searchState.value}
                onResultChange={results => setSearchState(prevState => ({ ...prevState, results }))}
                onChange={value => setSearchState(prevState => ({ ...prevState, value }))}
                navigateToFirstResult={true}
                onFocusChange={isFocused =>
                  setSearchState(prevState => ({ ...prevState, focused: !!isFocused }))
                }
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
              <SearchResultsList results={searchState.results} />
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

      {displayBreadcrumbs && <Breadcrumbs />}
    </Box>
  )
}

export default Navbar
