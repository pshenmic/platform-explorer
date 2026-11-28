'use client'

import { useState, useEffect, useRef } from 'react'
import type { LoadableState } from '../../types/common'
import * as Api from '../../util/Api'
import { useDebounce } from '../../hooks'
import { useRouter } from 'next/navigation'
import type { SearchResultsData } from './SearchResultsList'
import type { SearchCategory } from './constants'
import { getFirstResultUrl } from './getFirstResultUrl'
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
  const [resultsQuery, setResultsQuery] = useState('')
  const [searchResults, setSearchResults] = useState<LoadableState<SearchResultsData>>({
    data: {},
    loading: false,
    error: false
  })
  const debouncedQuery = useDebounce(searchQuery, 200)
  const router = useRouter()
  const searchGen = useRef(0)

  const search = (query: string) => {
    const gen = ++searchGen.current
    if (query?.length === 0) {
      setSearchResults({ data: {}, loading: false, error: false })
      return
    }

    setSearchResults({ data: {}, loading: true, error: false })

    Api.search(query)
      .then(res => {
        if (gen !== searchGen.current) return
        setResultsQuery(query)
        const data = res as SearchResultsData
        if (categoryFilters?.length > 0) {
          const filteredRes = filterResultByCategories(data, categoryFilters)
          setSearchResults({ data: filteredRes, loading: false, error: false })
          return
        }

        setSearchResults({ data, loading: false, error: false })
      })
      .catch(() => {
        if (gen !== searchGen.current) return
        setSearchResults({ data: {}, loading: false, error: true })
      })
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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return
    if (event.key.length === 1 || event.key === 'Enter') onFocusChange?.(true)
    if (event.key !== 'Enter') return

    if (navigateToFirstResult) {
      event.preventDefault()
      const query = searchQuery.trim()
      if (!query) return
      const url =
        !searchResults.loading && !searchResults.error && resultsQuery === searchQuery
          ? getFirstResultUrl(searchResults.data)
          : null
      router.push(url || `/search?query=${encodeURIComponent(query)}`)
      onFocusChange?.(false)
      return
    }

    if (!getFirstResultUrl(searchResults.data)) return search(searchQuery)
    if (typeof onEnter === 'function') return onEnter(searchResults.data || {})
  }

  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
    if (typeof onChange === 'function') onChange(event.target.value)
  }

  return (
    <div className={'GlobalSearchInput'}>
      <input
        value={searchQuery}
        type={'search'}
        placeholder={placeholder || 'Search...'}
        onChange={handleSearchInput}
        onKeyDown={handleKeyDown}
        className={'GlobalSearchInput__Field'}
      />
      <button
        type={'button'}
        aria-label={'Search'}
        className={'GlobalSearchInput__Button'}
        onClick={() => search(searchQuery)}
      >
        <svg width={'16'} height={'16'} viewBox={'0 0 24 24'} fill={'none'} aria-hidden={'true'}>
          <circle cx={'11'} cy={'11'} r={'7'} stroke={'currentColor'} strokeWidth={'1.75'} />
          <path
            d={'M20 20L16.5 16.5'}
            stroke={'currentColor'}
            strokeWidth={'1.75'}
            strokeLinecap={'round'}
          />
        </svg>
      </button>
    </div>
  )
}

export default GlobalSearchInput
