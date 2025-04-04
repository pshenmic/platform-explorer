'use client'

import { useEffect, useState } from 'react'
import { Button } from '@chakra-ui/react'
import { SubmitButton } from '../ui/forms'
import FilterActions from './FilterActions'
import { SearchResultsList, GlobalSearchInput } from '../search'
import { Identifier } from '../data'
import { ValueCard } from '../cards'
import './SearchFilter.scss'

const defaultSearchState = {
  results: { data: {}, loading: false, error: false },
  value: ''
}

const SelectedEntityElement = ({ entity, type }) => {
  switch (type) {
    case 'validators':
      return (
        <ValueCard clickable={true}>
          <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>
            {entity?.proTxHash}
          </Identifier>
        </ValueCard>
      )
    case 'identities':
      return (
        <ValueCard clickable={true}>
          <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>
            {entity?.identifier}
          </Identifier>
        </ValueCard>
      )
    default:
      return null
  }
}

export const SearchFilter = ({
  value,
  onChange,
  placeholder,
  showSubmitButton = false,
  onSubmit,
  title,
  entityType
}) => {
  const [searchState, setSearchState] = useState(defaultSearchState)
  const [selectedEntity, setSelectedEntity] = useState(value || null)
  const [searchFocused, setSearchFocused] = useState(false)
  const displayResults =
    Object.keys(searchState.results?.data).length ||
    searchState.results?.loading ||
    searchState.results?.error

  const selectEntity = (entity) => {
    switch (entityType) {
      case 'validators':
        setSelectedEntity(entity || null)
        onChange(entity?.proTxHash ?? null)
        break
      case 'identities':
        setSelectedEntity(entity)
        onChange(entity?.identifier || '')
        break
      default:
        setSelectedEntity(null)
        onChange(null)
    }

    setSearchFocused(false)
  }

  const clearSearch = () => {
    setSelectedEntity(null)
    setSearchState(defaultSearchState)
    setSearchFocused(true)
    onChange(null)
  }

  useEffect(() => {
    switch (entityType) {
      case 'validators':
        setSelectedEntity(value ? { proTxHash: value } : null)
        break
      case 'identities':
        setSelectedEntity(value ? { identifier: value } : null)
        break
      default:
        setSelectedEntity(value)
    }
  }, [value])

  return (
    <div className={'SearchFilter'}>
      {title &&
        <div className={'SearchFilter__Title'}>{title}</div>
      }

      {selectedEntity && !searchFocused
        ? <div
            className={'SearchFilter__selectedEntityContainer'}
            onClick={() => setSearchFocused(true)}
          >
            <SelectedEntityElement entity={selectedEntity} type={entityType}/>
          </div>
        : <div className={'SearchFilter__SearchContainer'}>
            <GlobalSearchInput
              forceValue={searchState.value}
              onResultChange={results => setSearchState(prevState => ({ ...prevState, results }))}
              onChange={value => setSearchState(prevState => ({ ...prevState, value }))}
              categoryFilters={[entityType]}
              placeholder={placeholder}
            />
            {displayResults &&
              <div className={'SearchFilter__ResultsContainer'}>
                <SearchResultsList
                  results={searchState.results}
                  onItemClick={selectEntity}
                />
              </div>
            }
          </div>
      }

      {showSubmitButton && (
        <FilterActions>
          <SubmitButton text={'Close'} onSubmit={onSubmit} />
          {selectedEntity &&
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
