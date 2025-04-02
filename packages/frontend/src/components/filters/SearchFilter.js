'use client'

import { useEffect, useState } from 'react'
import { Button } from '@chakra-ui/react'
import { SubmitButton } from '../ui/forms'
import FilterActions from './FilterActions'
import GlobalSearchInput from '../search/GlobalSearchInput'
import { SearchResultsList } from '../search'
import { Identifier } from '../data'
import { ValueCard } from '../cards'
import './SearchFilter.scss'

const defaultSearchState = {
  results: { data: {}, loading: false, error: false },
  value: ''
}

export const SearchFilter = ({
  value,
  onChange,
  placeholder,
  showSubmitButton = false,
  onSubmit,
  title,
  type
}) => {
  const [searchState, setSearchState] = useState(defaultSearchState)
  const [selectedIdentity, setSelectedIdentity] = useState(value || null)
  const [searchFocused, setSearchFocused] = useState(false)
  const displayResults =
    Object.keys(searchState.results?.data).length ||
    searchState.results?.loading ||
    searchState.results?.error

  const selectIdentity = (identity) => {
    setSelectedIdentity(identity)
    setSearchFocused(false)
    onChange(identity?.identifier || '')
  }

  console.log('search filters')

  const clearSearch = () => {
    setSelectedIdentity(null)
    setSearchState(defaultSearchState)
    setSearchFocused(true)
    onChange('')
  }

  useEffect(() => {
    setSelectedIdentity(value ? { identifier: value } : null)
  }, [value])

  return (
    <div className={'IdentityFilter'}>
      {title &&
        <div className={'IdentityFilter__Title'}>{title}</div>
      }

      {selectedIdentity && !searchFocused
        ? <div className={'IdentityFilter__SelectedIdentityContainer'} onClick={() => setSearchFocused(true)}>
            <ValueCard clickable={true}>
              <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>
                {selectedIdentity.identifier}
              </Identifier>
            </ValueCard>
          </div>
        : <div className={'IdentityFilter__SearchContainer'}>
            <GlobalSearchInput
              forceValue={searchState.value}
              onResultChange={results => setSearchState(prevState => ({ ...prevState, results }))}
              onChange={value => setSearchState(prevState => ({ ...prevState, value }))}
              categoryFilters={[type]}
              placeholder={placeholder}
            />
          {displayResults &&
            <div className={'IdentityFilter__ResultsContainer'}>
              <SearchResultsList
                results={searchState.results}
                onItemClick={selectIdentity}
              />
            </div>
          }
          </div>
      }

      {showSubmitButton && (
        <FilterActions>
          <SubmitButton text={'Close'} onSubmit={onSubmit} />
          {selectedIdentity &&
            <Button
              variant={'gray'}
              size={'sm'}
              onClick={clearSearch}
            >
              Clear
            </Button>
          }
        </FilterActions>
      )}
    </div>
  )
}
