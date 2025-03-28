import { useState, useEffect } from 'react'
import * as Api from '../../util/Api'
import { Input, InputGroup, InputRightElement, Button } from '@chakra-ui/react'
import { SearchIcon } from '../ui/icons'
import { useDebounce } from '../../hooks'
import './GlobalSearchInput.scss'

function filterResultByCategories (obj = {}, categories) {
  return categories.reduce((filtered, key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      filtered[key] = obj[key]
    }
    return filtered
  }, {})
}

function GlobalSearchInput ({ onResultChange, forceValue, onChange, categoryFilters = [], placeholder }) {
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedQuery = useDebounce(searchQuery, 200)

  const search = (query) => {
    if (query?.length === 0) {
      onResultChange({ data: {}, loading: false, error: false })
      return
    }

    onResultChange({ data: {}, loading: true, error: false })

    Api.search(query)
      .then(res => {
        if (categoryFilters?.length > 0) {
          const filteredRes = filterResultByCategories(res, categoryFilters)
          onResultChange({ data: filteredRes, loading: false, error: false })
          return
        }

        onResultChange({ data: res, loading: false, error: false })
      })
      .catch(err => onResultChange({ data: err, loading: false, error: true }))
  }

  useEffect(() => search(debouncedQuery), [debouncedQuery])

  useEffect(() => setSearchQuery(forceValue), [forceValue])

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      search(searchQuery)
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
          pr={'4.5rem'}
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
