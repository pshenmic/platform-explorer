'use client'

import { useEffect, useState } from 'react'
import type { ComponentType, ReactNode } from 'react'
import { SubmitButton } from '../ui/forms'
import FilterActions from './FilterActions'
import { SearchResultsList, GlobalSearchInput } from '../search'
import type { SearchResultsData } from '../search/SearchResultsList'
import type { SearchCategory } from '../search/constants'
import type { LoadableState } from '../../types/common'
import IdentifierJs from '../data/Identifier'
import { ValueCard } from '../cards'
import './SearchFilter.css'
import './Filters.css'

const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  avatar?: boolean
  ellipsis?: boolean
  styles?: string[]
  copyButton?: boolean
}>

interface SearchState {
  results: LoadableState<SearchResultsData>
  value: string
}

const defaultSearchState: SearchState = {
  results: { data: {}, loading: false, error: false },
  value: ''
}

interface SelectedEntityElementProps {
  entity?: {
    proTxHash?: string
    identifier?: string
    dataContracts?: string
  } | null
  type?: SearchCategory | string
}

const SelectedEntityElement = ({ entity, type }: SelectedEntityElementProps) => {
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

interface SearchFilterProps {
  value?: string | null
  onChange: (value: string | null) => void
  placeholder?: string
  showSubmitButton?: boolean
  onSubmit?: () => void
  title?: ReactNode
  entityType?: SearchCategory
}

export const SearchFilter = ({
  value,
  onChange,
  placeholder,
  showSubmitButton = false,
  onSubmit,
  title,
  entityType
}: SearchFilterProps) => {
  const [searchState, setSearchState] = useState<SearchState>(defaultSearchState)
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntityElementProps['entity']>(
    value ? { identifier: value, proTxHash: value } : null
  )
  const [searchFocused, setSearchFocused] = useState(false)
  const displayResults =
    Object.keys(searchState.results?.data || {}).length ||
    searchState.results?.loading ||
    searchState.results?.error

  const selectEntity = (data: unknown) => {
    const entity = data as {
      proTxHash?: string
      identifier?: string
    } | null

    switch (entityType) {
      case 'validators':
        setSelectedEntity(entity || null)
        onChange(entity?.proTxHash ?? null)
        break
      case 'identities':
        setSelectedEntity(entity)
        onChange(entity?.identifier || '')
        break
      case 'dataContracts':
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
      case 'dataContracts':
        setSelectedEntity(value ? { dataContracts: value } : null)
        break
      default:
        setSelectedEntity(value ? { identifier: value } : null)
    }
  }, [value, entityType])

  return (
    <div className={'SearchFilter'}>
      {title && <div className={'SearchFilter__Title'}>{title}</div>}

      {selectedEntity && !searchFocused ? (
        <div
          className={'SearchFilter__selectedEntityContainer'}
          onClick={() => setSearchFocused(true)}
        >
          <SelectedEntityElement entity={selectedEntity} type={entityType} />
        </div>
      ) : (
        <div className={'SearchFilter__SearchContainer'}>
          <GlobalSearchInput
            forceValue={searchState.value}
            onResultChange={results => setSearchState(prevState => ({ ...prevState, results }))}
            onChange={nextValue =>
              setSearchState(prevState => ({ ...prevState, value: nextValue }))
            }
            categoryFilters={entityType ? [entityType] : []}
            placeholder={placeholder}
          />
          {displayResults ? (
            <div className={'SearchFilter__ResultsContainer'}>
              <SearchResultsList results={searchState.results} onItemClick={selectEntity} />
            </div>
          ) : null}
        </div>
      )}

      {showSubmitButton && (
        <FilterActions>
          <SubmitButton text={'Close'} onSubmit={onSubmit} />
          {selectedEntity && (
            <button type={'button'} className={'Filters__Button Filters__Button--Gray'} onClick={clearSearch}>
              Clear
            </button>
          )}
        </FilterActions>
      )}
    </div>
  )
}
