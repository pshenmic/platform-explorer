import { useState, useEffect } from 'react'
import * as Api from '../../util/Api'
import { Input, InputGroup, InputRightElement, Button } from '@chakra-ui/react'
import { SearchIcon } from '../ui/icons'
import './GlobalSearchInput.scss'
import mockSearchResults from '../layout/navbar/mockSearchResults'
import { useDebounce } from '../../hooks'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'

function GlobalSearchInput ({ onResultChange, forceValue, onChange }) {
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
        if (searchQuery?.length > 0) {
          fetchHandlerSuccess(onResultChange, mockSearchResults)
          // fetchHandlerSuccess(onResultChange, res)
        } else {
          fetchHandlerSuccess(onResultChange, {})
        }
      })
      .catch(err => fetchHandlerError(onResultChange, err))
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
          placeholder={'Search...'}
          onChange={handleSearchInput}
          onKeyPress={handleKeyPress}
          color={'gray.250'}
          fontSize={'12px'}
          className={'GlobalSearchInput__Field'}
        />
          <InputRightElement>
            <Button
              h={'28px'}
              w={'28px !important'}
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
