import { useCallback, useEffect, useRef } from 'react'
import { Button, useDisclosure } from '@chakra-ui/react'
import { useFilters } from '../../hooks'
import { MultiSelectFilter, InputFilter, RangeFilter, FilterGroup, ActiveFilters } from './'
import { BottomSheet } from '../ui/sheets'
import { ChevronIcon } from '../ui/icons'
import { MultiLevelMenu } from '../ui/menus'
import './Filters.scss'

export const Filters = ({
  filtersConfig,
  initialFilters = {},
  onFilterChange,
  isMobile = false,
  buttonText = 'Add filter',
  className = ''
}) => {
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

  const previousFilters = useRef(filters)

  const applyFilters = useCallback(() => {
    if (typeof onFilterChange !== 'function') return

    const processedFilters = (() => {
      return Object.entries(filters).reduce((result, [key, value]) => {
        const filterKeyConfig = filtersConfig[key]

        if (filterKeyConfig.type === 'multiselect' && (filterKeyConfig.isAllSelected(value) || value?.length === 0)) {
          return result
        }

        if (value === '') {
          return result
        }

        if (filterKeyConfig.type === 'range' && (!value.min && !value.max)) {
          return result
        }

        result[key] = value
        return result
      }, {})
    })()

    if (JSON.stringify(previousFilters.current) === JSON.stringify(processedFilters)) {
      return
    }

    previousFilters.current = processedFilters
    onFilterChange(processedFilters)
  }, [filters, onFilterChange, filtersConfig])

  useEffect(applyFilters, [applyFilters])

  const { isOpen: menuIsOpen, onOpen: menuOnOpen, onClose: menuOnClose } = useDisclosure()

  const submitHandler = () => {
    applyFilters()
    menuOnClose()
  }

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

  const handleToggleAll = useCallback((filterName, values) => {
    const newFilters = baseHandleFilterChange(filterName, values)
    setFilters(newFilters)
  }, [baseHandleFilterChange, setFilters])

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
              value={filters[key]}
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
              value={filters[key]}
              onChange={(value) => handleFilterChange(key, value)}
              placeholder={config.placeholder}
              showSubmitButton={true}
              onSubmit={submitHandler}
            />
          </FilterGroup>
        )
        break
      default:
        content = null
    }

    const activeFilterValue = !filtersConfig[key].isAllSelected?.(filters[key]) && filters[key]
      ? filtersConfig[key].formatValue?.(filters[key])
      : null

    return {
      label: config.label,
      content,
      activeFilterValue
    }
  })

  const TriggerButton = () => (
    <Button
      className={'Filters__Button'}
      onClick={() => menuIsOpen ? menuOnClose() : menuOnOpen()}
      variant={'brand'}
      size={'sm'}
    >
      <span>{buttonText}</span>
      <ChevronIcon css={{
        transition: '.1s',
        transform: menuIsOpen ? 'rotate(-90deg)' : 'rotate(90deg)'
      }}/>
    </Button>
  )

  return (
    <div className={`Filters ${className || ''}`}>
      <div className={'Filters__ButtonsContainer'}>
        {isMobile
          ? <TriggerButton/>
          : <MultiLevelMenu
              placement={'bottom-start'}
              trigger={<TriggerButton/>}
              menuData={menuData}
              onClose={menuOnClose}
              isOpen={menuIsOpen}
              onOpen={menuOnOpen}
            />
          }

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
          isOpen={menuIsOpen}
          onClose={menuOnClose}
          onOpen={menuOnOpen}
          title={'Filters'}
        >
          <div className="Filters__MobileContent">
            {menuData.map((item, index) => (
              <div key={index} className="Filters__MobileItem">
                <div className="Filters__MobileItemHeader">
                  <span className="Filters__MobileItemLabel">{item.label}</span>
                  {item.activeFilterValue && (
                    <span className="Filters__MobileItemActiveFilter">
                      {item.activeFilterValue}
                    </span>
                  )}
                </div>
                {item.content}
              </div>
            ))}
          </div>
        </BottomSheet>
      )}
    </div>
  )
}
