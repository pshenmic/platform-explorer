import { useCallback, useEffect } from 'react'
import { Button, useDisclosure } from '@chakra-ui/react'
import { useFilters } from '../../hooks'
import { MultiSelectFilter, InputFilter, RangeFilter, FilterGroup, ActiveFilters } from './'
import { BottomSheet } from '../ui/sheets'
import { ChevronIcon } from '../ui/icons'
import { MultiLevelMenu } from '../ui/menus'

export const Filters = ({
  filtersConfig,
  initialFilters = {},
  onFilterChange,
  isMobile = false,
  buttonText = 'Add Filter',
  className = ''
}) => {
  // Generate default filter values from config
  const defaultFilters = Object.fromEntries(
    Object.keys(filtersConfig).map(key => [
      key,
      initialFilters?.[key] ?? filtersConfig[key].defaultValue
    ])
  )

  const {
    filters,
    setFilters,
    handleFilterChange: baseHandleFilterChange,
    handleMultipleValuesChange: baseHandleMultipleValuesChange
  } = useFilters(defaultFilters)

  useEffect(() => {
    if (typeof onFilterChange === 'function') {
      onFilterChange(filters)
    }
  }, [filters, onFilterChange])

  const { isOpen: mobileIsOpen, onOpen: mobileOnOpen, onClose: mobileOnClose } = useDisclosure()

  // Handle single filter change
  const handleFilterChange = useCallback((filterName, value) => {
    const newFilters = baseHandleFilterChange(filterName, value)
    setFilters(newFilters)
  }, [baseHandleFilterChange, setFilters])

  // Handle multiple values filter change
  const handleMultipleValuesChange = useCallback((fieldName, value) => {
    const newFilters = baseHandleMultipleValuesChange(fieldName, value)
    setFilters(newFilters)
  }, [baseHandleMultipleValuesChange, setFilters])

  // Handle select all values for a filter
  const handleSelectAll = useCallback((filterName) => {
    const config = filtersConfig[filterName]
    if (config.type === 'multiselect') {
      const allValues = config.options.map(item => item.value)
      const newFilters = baseHandleFilterChange(filterName, allValues)
      setFilters(newFilters)
    }
  }, [baseHandleFilterChange, filtersConfig, setFilters])

  // Clear a specific filter
  const clearFilter = useCallback((filterName) => {
    const newFilters = {
      ...filters,
      [filterName]: filtersConfig[filterName].defaultValue
    }
    setFilters(newFilters)
  }, [filters, filtersConfig, setFilters])

  const menuData = Object.entries(filtersConfig).map(([key, config]) => {
    let content

    switch (config.type) {
      case 'multiselect':
        content = (
          <FilterGroup title={config.title}>
            <MultiSelectFilter
              items={config.options}
              selectedValues={filters[key]}
              onItemClick={(value) => handleMultipleValuesChange(key, value)}
              onSelectAll={() => handleSelectAll(key)}
              showSelectAll={true}
            />
          </FilterGroup>
        )
        break
      case 'range':
        content = (
          <FilterGroup title={config.title}>
            <RangeFilter
              value={filters[key]}
              onChange={(value) => handleFilterChange(key, value)}
              type={'number'}
              minTitle={config.minTitle}
              minPlaceholder={config.minPlaceholder}
              maxTitle={config.maxTitle}
              maxPlaceholder={config.maxPlaceholder}
            />
          </FilterGroup>
        )
        break
      case 'input':
        content = (
          <FilterGroup title={config.title}>
            <InputFilter
              value={filters[key]}
              onChange={(value) => handleFilterChange(key, value)}
              placeholder={config.placeholder}
            />
          </FilterGroup>
        )
        break
      default:
        content = null
    }

    return {
      label: config.label,
      content
    }
  })

  return (
    <div className={`Filters ${className || ''}`}>
      <div className={'Filters__ButtonsContainer'}>
        <MultiLevelMenu
          placement={'bottom-start'}
          trigger={
            <Button
              className={'Filters__Button'}
              onClick={() => mobileIsOpen ? mobileOnClose() : mobileOnOpen()}
              variant={'brand'}
              size={'sm'}
            >
              <span>{buttonText}</span>
              <ChevronIcon css={{
                transition: '.1s',
                transform: mobileIsOpen ? 'rotate(-90deg)' : 'rotate(90deg)'
              }}/>
            </Button>
          }
          menuData={menuData}
        />

        <ActiveFilters
          filters={filters}
          onClearFilter={clearFilter}
          allValuesSelected={(key, value) => filtersConfig[key]?.isAllSelected?.(value) || false}
          formatValue={(key, value) => filtersConfig[key]?.formatValue(value)}
          getFilterLabel={(key) => filtersConfig[key]?.label || key}
        />
      </div>

      {isMobile && (
        <BottomSheet
          isOpen={mobileIsOpen}
          onClose={mobileOnClose}
          onOpen={mobileOnOpen}
          title={'Filters'}
        >
          <div className="Filters__MobileContent">
            {menuData.map((item, index) => (
              <div key={index} className="Filters__MobileItem">
                <div className="Filters__MobileItemTitle">{item.label}</div>
                {item.content}
              </div>
            ))}
          </div>
        </BottomSheet>
      )}
    </div>
  )
}
