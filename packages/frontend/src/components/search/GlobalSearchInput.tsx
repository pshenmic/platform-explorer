'use client'

import { useState, useEffect } from 'react'
import type { LoadableState } from '../../types/common'
import * as Api from '../../util/Api'
import { Input, InputGroup, InputRightElement, Button } from '@chakra-ui/react'
import { SearchIcon } from '../ui/icons'
import { useDebounce } from '../../hooks'
import { useRouter } from 'next/navigation'
import type { SearchResultsData } from './SearchResultsList'
import type { SearchCategory } from './constants'
import './GlobalSearchInput.css'

function filterResultByCategories(
  obj: SearchResultsData = {},
  categories: SearchCategory[]
): SearchResultsData {
  return categories.reduce<SearchResultsData>((filtered, key) => {
    if (Object.hasOwn(obj, key)) {
      filtered[key] = obj[key]
    }
    return filtered
  }, {})
}

interface GlobalSearchInputProps {
  onResultChange?: (results: LoadableState<SearchResultsData>) => void
  forceValue?: string
  onChange?: (value: string) => void
  categoryFilters?: SearchCategory[]
  placeholder?: string
  onEnter?: (data: SearchResultsData) => void
  navigateToFirstResult?: boolean
  onFocusChange?: (focused: boolean) => void
}

function GlobalSearchInput({
  onResultChange,
  forceValue,
  onChange,
  categoryFilters = [],
  placeholder,
  onEnter,
  navigateToFirstResult,
  onFocusChange
}: GlobalSearchInputProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<LoadableState<SearchResultsData>>({
    data: {},
    loading: false,
    error: false
  })
  const debouncedQuery = useDebounce(searchQuery, 200)
  const router = useRouter()

  const search = (query: string) => {
    if (query?.length === 0) {
      setSearchResults({ data: {}, loading: false, error: false })
      return
    }

    setSearchResults({ data: {}, loading: true, error: false })

    Api.search(query)
      .then(res => {
        const data = res as SearchResultsData
        if (categoryFilters?.length > 0) {
          const filteredRes = filterResultByCategories(data, categoryFilters)
          setSearchResults({ data: filteredRes, loading: false, error: false })
          return
        }

        setSearchResults({ data, loading: false, error: false })
      })
      .catch(err =>
        setSearchResults({ data: err as SearchResultsData, loading: false, error: true })
      )
  }

  useEffect(() => {
    search(debouncedQuery)
  }, [debouncedQuery])
  useEffect(() => {
    onResultChange?.(searchResults)
  }, [searchResults])
  useEffect(() => {
    if (forceValue !== undefined) setSearchQuery(forceValue)
  }, [forceValue])

  const getFirstResultUrl = (): string | null => {
    const data = searchResults.data

    if (!data || Object.keys(data).length === 0) return null

    const firstCategory = (Object.keys(data) as SearchCategory[]).find(
      category => (data[category]?.length ?? 0) > 0
    )

    if (firstCategory && (data[firstCategory]?.length ?? 0) > 0) {
      const firstItem = data[firstCategory]![0] as Record<string, unknown>

      switch (firstCategory) {
        case 'identities':
          return `/identity/${(firstItem as { identifier?: string }).identifier}`
        case 'blocks': {
          const header = (firstItem as { header?: { hash?: string } }).header
          return `/block/${header?.hash}`
        }
        case 'transactions':
          return `/transaction/${(firstItem as { hash?: string }).hash}`
        case 'dataContracts':
          return `/dataContract/${(firstItem as { identifier?: string }).identifier}`
        case 'documents':
          return `/document/${(firstItem as { identifier?: string }).identifier}`
        case 'validators':
          return `/validator/${(firstItem as { proTxHash?: string }).proTxHash}`
        case 'tokens':
          return `/token/${(firstItem as { identifier?: string }).identifier}`
        case 'platformAddresses':
          return `/platformAddress/${(firstItem as { bech32mAddress?: string }).bech32mAddress}`
        default:
          return null
      }
    }

    return null
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (typeof onFocusChange === 'function') onFocusChange(true)

    if (event.key === 'Enter') {
      if (!searchResults.data || Object.keys(searchResults.data).length === 0) {
        return search(searchQuery)
      }

      if (typeof onEnter === 'function') {
        return onEnter(searchResults.data)
      }

      if (navigateToFirstResult) {
        const url = getFirstResultUrl()

        if (url) {
          router.push(url)
          if (typeof onFocusChange === 'function') onFocusChange(false)
        }
      }
    }
  }

  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
    if (typeof onChange === 'function') onChange(event.target.value)
  }

  return (
    <div>
      <InputGroup size={'md'} className={'GlobalSearchInput'}>
        <Input
          pr={'2.5rem'}
          value={searchQuery}
          type={'text'}
          placeholder={placeholder || 'Search...'}
          onChange={handleSearchInput}
          onKeyPress={handleKeyPress}
          color={'gray.250'}
          fontSize={'0.75rem'}
          className={'GlobalSearchInput__Field'}
        />
        <InputRightElement>
          <Button
            h={'28px'}
            w={'28px'}
            minW={'none'}
            size={'xxs'}
            onClick={() => search(searchQuery)}
            className={'GlobalSearchInput__Button'}
          >
            <SearchIcon w={'14px'} color={'whiteAlpha.900'} />
          </Button>
        </InputRightElement>
      </InputGroup>
    </div>
  )
}

export default GlobalSearchInput
