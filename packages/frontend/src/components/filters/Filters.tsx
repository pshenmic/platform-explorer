'use client'

import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { Button, useDisclosure } from '@chakra-ui/react'
import { useFilters } from '../../hooks'
import type { FilterValue, Filters as UseFiltersState } from '../../hooks/useFilters'
import { MultiSelectFilter, InputFilter, RangeFilter, FilterGroup, ActiveFilters, SearchFilter } from './'
import { BottomSheet } from '../ui/sheets'
import { ChevronIcon } from '../ui/icons'
import { MultiLevelMenu } from '../ui/menus'
import { MobileFilterMenu } from './MobileFilterMenu'
import { DateRangeFilter } from './DateRangeFilter'
import type {
  DateRangeFilterValue,
  FilterMenuItem,
  FilterState,
  FilterStateValue,
  FiltersConfig,
  RangeFilterValue
} from './types'
import type { WithClassName } from '../../types/common'

import './Filters.scss'

interface FiltersProps extends WithClassName {
  filtersConfig: FiltersConfig
  initialFilters?: FilterState
  onFilterChange?: (filters: Record<string, unknown>) => void
  isMobile?: boolean
  buttonText?: string
  /** If true, filters apply immediately on change. If false, filters apply only on menu close/submit */
  applyOnChange?: boolean
}

export const Filters = ({
  filtersConfig,
  initialFilters = {},
  onFilterChange,
  isMobile = false,
  buttonText = 'Add filter',
  className = '',
  applyOnChange = false
}: FiltersProps) => {
  const defaultFilters: FilterState = Object.fromEntries(
    Object.keys(filtersConfig).map(key => [
      key,
      initialFilters?.[key] ?? filtersConfig[key].defaultValue
    ])
  )

  /** Menu filters - temporary state while user is selecting filters */
  const {
    filters: menuFiltersRaw,
    setFilters: setMenuFiltersRaw,
    handleFilterChange: baseHandleFilterChange,
    handleMultipleValuesChange: baseHandleMultipleValuesChange
  } = useFilters(defaultFilters as UseFiltersState)

  const menuFilters = menuFiltersRaw as FilterState
  const setMenuFilters = setMenuFiltersRaw as unknown as Dispatch<SetStateAction<FilterState>>

  /** Applied filters - actual filters that are applied and shown in ActiveFilters */
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(defaultFilters)

  const previousAppliedFilters = useRef<Record<string, unknown>>(appliedFilters as Record<string, unknown>)

  const applyFilters = useCallback((filtersToApply: FilterState = menuFilters) => {
    if (typeof onFilterChange !== 'function') return

    const processedFilters = (() => {
      return Object.entries(filtersToApply).reduce<Record<string, unknown>>((result, [key, value]) => {
        const filterKeyConfig = filtersConfig[key]

        if (filterKeyConfig.type === 'multiselect' && (filterKeyConfig.isAllSelected?.(value) || (Array.isArray(value) && value.length === 0))) {
          return result
        }

        if (value === '') {
          return result
        }

        if (filterKeyConfig.type === 'range') {
          const rangeValue = value as RangeFilterValue | undefined
          if (!rangeValue?.min && !rangeValue?.max) return result

          return {
            ...result,
            ...(rangeValue?.min && { [`${key}_min`]: rangeValue?.min }),
            ...(rangeValue?.max && { [`${key}_max`]: rangeValue?.max })
          }
        }

        if (filterKeyConfig.type === 'daterange') {
          const dateValue = value as DateRangeFilterValue | undefined
          if (!dateValue?.start && !dateValue?.end) return result

          return {
            ...result,
            ...(dateValue?.start && { [`${key}_start`]: dateValue?.start?.toISOString() }),
            ...(dateValue?.end && { [`${key}_end`]: dateValue?.end?.toISOString() })
          }
        }

        return {
          ...result,
          [key]: value
        }
      }, {})
    })()

    /** Update applied filters state */
    setAppliedFilters(filtersToApply)

    if (JSON.stringify(previousAppliedFilters.current) === JSON.stringify(processedFilters)) {
      return
    }

    previousAppliedFilters.current = processedFilters
    onFilterChange(processedFilters)
  }, [menuFilters, onFilterChange, filtersConfig])

  /** Apply filters immediately only if applyOnChange is true */
  useEffect(() => {
    if (applyOnChange) {
      applyFilters()
    }
  }, [applyFilters, applyOnChange])

  const { isOpen: menuIsOpen, onOpen: menuOnOpen, onClose: menuOnClose } = useDisclosure()
  const [isMenuInitialized, setIsMenuInitialized] = useState(false)

  /** Sync menu filters with applied filters when menu opens */
  const handleMenuOpen = useCallback(() => {
    // Only sync on first open or in desktop mode
    if (!isMenuInitialized || !isMobile) {
      setMenuFilters(appliedFilters)
      setIsMenuInitialized(true)
    }

    menuOnOpen()
  }, [appliedFilters, setMenuFilters, menuOnOpen, isMenuInitialized, isMobile])

  const handleMenuClose = useCallback(() => {
    /** Apply filters when menu closes (if not applying on change) */
    if (!applyOnChange) {
      applyFilters()
    }
    setIsMenuInitialized(false)
    menuOnClose()
  }, [applyFilters, applyOnChange, menuOnClose])

  const submitHandler = () => {
    /** Always apply filters when submit is pressed */
    applyFilters()
    setIsMenuInitialized(false)
    menuOnClose()
  }

  /** Handle single filter change in menu */
  const handleFilterChange = useCallback((filterName: string, value: FilterStateValue) => {
    baseHandleFilterChange(filterName, value as FilterValue)
  }, [baseHandleFilterChange])

  /** Handle multiple values filter change in menu */
  const handleMultipleValuesChange = useCallback((fieldName: string, value: string) => {
    baseHandleMultipleValuesChange(fieldName, value)
  }, [baseHandleMultipleValuesChange])

  const handleToggleAll = useCallback((filterName: string, values: string[]) => {
    setMenuFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: values
    }))
  }, [setMenuFilters])

  /** Clear a specific applied filter */
  const clearAppliedFilter = useCallback((filterName: string) => {
    const newAppliedFilters = {
      ...appliedFilters,
      [filterName]: filtersConfig[filterName].defaultValue
    }

    /** Update both applied and menu filters */
    setAppliedFilters(newAppliedFilters)
    setMenuFilters(newAppliedFilters)

    /** Apply filters immediately */
    applyFilters(newAppliedFilters)
  }, [appliedFilters, filtersConfig, setMenuFilters, applyFilters])

  const resetAllAppliedFilters = useCallback(() => {
    const nextDefaultFilters: FilterState = Object.fromEntries(
      Object.keys(filtersConfig).map(key => [
        key,
        filtersConfig[key].defaultValue
      ])
    )

    /** Update both applied and menu filters */
    setAppliedFilters(nextDefaultFilters)
    setMenuFilters(nextDefaultFilters)
    setIsMenuInitialized(false)

    /** Apply empty filters immediately */
    if (typeof onFilterChange === 'function') {
      onFilterChange({})
    }
  }, [filtersConfig, setMenuFilters, onFilterChange])

  const menuData: FilterMenuItem[] = useMemo(() => Object.entries(filtersConfig).map(([key, config]) => {
    let content

    switch (config.type) {
      case 'multiselect':
        content = (
          <FilterGroup title={config.title}>
            <MultiSelectFilter
              items={config.options}
              selectedValues={(menuFilters[key] as string[] | undefined) ?? []}
              onItemClick={(value) => handleMultipleValuesChange(key, value)}
              onSelectAll={(values) => handleToggleAll(key, values)}
              showToggleAll={true}
              showSubmitButton={true}
              onSubmit={submitHandler}
            />
          </FilterGroup>
        )
        break
      case 'range':
        content = (
          <FilterGroup title={config.title}>
            <RangeFilter
              value={(menuFilters[key] as RangeFilterValue | undefined) ?? { min: '', max: '' }}
              onChange={(value) => handleFilterChange(key, value)}
              type={'number'}
              minTitle={config.minTitle}
              minPlaceholder={config.minPlaceholder}
              maxTitle={config.maxTitle}
              maxPlaceholder={config.maxPlaceholder}
              showSubmitButton={true}
              onSubmit={submitHandler}
            />
          </FilterGroup>
        )
        break
      case 'input':
        content = (
          <FilterGroup title={config.title}>
            <InputFilter
              value={menuFilters[key] as string | number | null | undefined}
              onChange={(value) => handleFilterChange(key, value)}
              placeholder={config.placeholder}
              showSubmitButton={true}
              onSubmit={submitHandler}
            />
          </FilterGroup>
        )
        break
      case 'search':
        content = (
          <FilterGroup title={config?.title}>
            <SearchFilter
              value={menuFilters[key] as string | null | undefined}
              onChange={(value) => handleFilterChange(key, value)}
              placeholder={config?.placeholder}
              showSubmitButton={true}
              onSubmit={submitHandler}
              entityType={config?.entityType}
            />
          </FilterGroup>
        )
        break
      case 'daterange':
        content = (
          <FilterGroup title={config?.title}>
            <DateRangeFilter
              value={(menuFilters[key] as DateRangeFilterValue | undefined) ?? { start: null, end: null }}
              onChange={(value) => handleFilterChange(key, value)}
              onSubmit={submitHandler}
            />
          </FilterGroup>
        )
        break
      default:
        content = null
    }

    /** Use applied filters for activeFilterValue (what shows in ActiveFilters) */
    const activeFilterValue = !filtersConfig[key].isAllSelected?.(appliedFilters[key]) && appliedFilters[key]
      ? filtersConfig[key].formatValue?.(appliedFilters[key])
      : null

    return {
      label: config.label,
      title: config.title,
      content,
      activeFilterValue,
      type: config.type,
      filterKey: key,
      rawValue: appliedFilters[key], // Use applied filters for ActiveFilters display
      options: config.options || null,
      mobileTagRenderer: config.mobileTagRenderer || null
    }
  }), [filtersConfig, menuFilters, appliedFilters, handleMultipleValuesChange, handleFilterChange, handleToggleAll])

  const TriggerButton = () => (
    <Button
      className={'Filters__Button Filters__Button--ToggleFilters '}
      onClick={() => menuIsOpen ? handleMenuClose() : handleMenuOpen()}
      variant={'brand'}
      size={'sm'}
    >
      <span>{buttonText}</span>
      <ChevronIcon css={{
        transition: '.1s',
        transform: menuIsOpen ? 'rotate(-90deg)' : 'rotate(90deg)'
      }} />
    </Button>
  )

  const activeFiltersCount = menuData.filter(item => item.activeFilterValue).length

  return (
    <div className={`Filters ${isMobile ? 'Filters--Mobile' : ''} ${className || ''}`}>
      <div className={'Filters__ButtonsContainer'}>
        <div className={'Filters__ControlButtons'}>
          {isMobile
            ? <TriggerButton />
            : <MultiLevelMenu
                placement={'bottom-start'}
                trigger={TriggerButton()}
                menuData={menuData}
                onClose={handleMenuClose}
                isOpen={menuIsOpen}
                onOpen={handleMenuOpen}
              />
          }

          {activeFiltersCount > 0 &&
            <Button
              className={'Filters__Button'}
              variant={'gray'}
              size={'sm'}
              onClick={resetAllAppliedFilters}
            >
              Clear ({activeFiltersCount})
            </Button>
          }
        </div>

        <ActiveFilters
          filters={appliedFilters}
          onClearFilter={clearAppliedFilter}
          allValuesSelected={(key, value) => filtersConfig[key]?.isAllSelected?.(value) || false}
          formatValue={(key, value) => filtersConfig[key]?.formatValue?.(value)}
          getFilterLabel={(key) => filtersConfig[key]?.label || key}
        />
      </div>

      {isMobile && (
        <BottomSheet
          isOpen={menuIsOpen}
          onClose={handleMenuClose}
          onOpen={handleMenuOpen}
          fullHeightOnly={true}
        >
          <MobileFilterMenu
            menuData={menuData}
            onSubmit={submitHandler}
            onReset={resetAllAppliedFilters}
          />
        </BottomSheet>
      )}
    </div>
  )
}
