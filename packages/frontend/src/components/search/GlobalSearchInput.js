import { useState, useEffect } from 'react'
import * as Api from '../../util/Api'
import { Input, InputGroup, InputRightElement, Button } from '@chakra-ui/react'
import { SearchIcon } from '../ui/icons'
import { useDebounce } from '../../hooks'
import { useRouter } from 'next/navigation'
import './GlobalSearchInput.scss'

function filterResultByCategories (obj = {}, categories) {
  return categories.reduce((filtered, key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      filtered[key] = obj[key]
    }
    return filtered
  }, {})
}

function GlobalSearchInput ({ onResultChange, forceValue, onChange, categoryFilters = [], placeholder, onEnter, navigateToFirstResult, onFocusChange }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState({ data: {}, loading: false, error: false })
  const debouncedQuery = useDebounce(searchQuery, 200)
  const router = useRouter()

  const search = (query) => {
    if (query?.length === 0) {
      setSearchResults({ data: {}, loading: false, error: false })
      return
    }

    setSearchResults({ data: {}, loading: true, error: false })

    Api.search(query)
      .then(res => {
        if (categoryFilters?.length > 0) {
          const filteredRes = filterResultByCategories(res, categoryFilters)
          setSearchResults({ data: filteredRes, loading: false, error: false })
          return
        }

        setSearchResults({ data: res, loading: false, error: false })
      })
      .catch(err => setSearchResults({ data: err, loading: false, error: true }))
  }

  useEffect(() => search(debouncedQuery), [debouncedQuery])
  useEffect(() => onResultChange(searchResults), [searchResults])
  useEffect(() => setSearchQuery(forceValue), [forceValue])

  const getFirstResultUrl = () => {
    const data = searchResults.data

    if (!data || Object.keys(data).length === 0) return null

    const firstCategory = Object.keys(data).find(category => data[category]?.length > 0)

    if (firstCategory && data[firstCategory]?.length > 0) {
      const firstItem = data[firstCategory][0]

      switch (firstCategory) {
        case 'identities':
          return `/identity/${firstItem.identifier}`
        case 'blocks':
          return `/block/${firstItem.header.hash}`
        case 'transactions':
          return `/transaction/${firstItem.hash}`
        case 'dataContracts':
          return `/dataContract/${firstItem.identifier}`
        case 'documents':
          return `/document/${firstItem.identifier}`
        case 'validators':
          return `/validator/${firstItem.proTxHash}`
        default:
          return null
      }
    }

    return null
  }

  const handleKeyPress = (event) => {
    if (typeof onFocusChange === 'function') onFocusChange(true)

    if (event.key === 'Enter') {
      if (Object.keys(searchResults.data).length === 0) {
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

  const handleSearchInput = (event) => {
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
              <SearchIcon w={'14px'} color={'whiteAlpha.900'}/>
            </Button>
          </InputRightElement>
      </InputGroup>
    </div>
  )
}

export default GlobalSearchInput
