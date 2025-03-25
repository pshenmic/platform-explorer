import { useCallback, useEffect } from 'react'
import { Button, useDisclosure } from '@chakra-ui/react'
import { StateTransitionEnum, TransactionTypesInfo } from '../../enums/state.transition.type'
import { useFilters } from '../../hooks'
import { MultiSelectFilter, InputFilter, RangeFilter, FilterGroup, ActiveFilters } from '../filters'
import { BottomSheet } from '../ui/sheets'
import { ChevronIcon } from '../ui/icons'
import { TransactionStatusBadge, TypeBadge } from './index'
import { MultiLevelMenu } from '../ui/menus'
import './TransactionsFilter.scss'

const TRANSACTION_TYPES = [
  {
    label: <TypeBadge typeId={StateTransitionEnum.DATA_CONTRACT_CREATE}/>,
    title: TransactionTypesInfo.DATA_CONTRACT_CREATE.title,
    value: StateTransitionEnum.DATA_CONTRACT_CREATE
  },
  {
    label: <TypeBadge typeId={StateTransitionEnum.DOCUMENTS_BATCH}/>,
    title: TransactionTypesInfo.DOCUMENTS_BATCH.title,
    value: StateTransitionEnum.DOCUMENTS_BATCH
  },
  {
    label: <TypeBadge typeId={StateTransitionEnum.IDENTITY_CREATE}/>,
    title: TransactionTypesInfo.IDENTITY_CREATE.title,
    value: StateTransitionEnum.IDENTITY_CREATE
  },
  {
    label: <TypeBadge typeId={StateTransitionEnum.IDENTITY_TOP_UP}/>,
    title: TransactionTypesInfo.IDENTITY_TOP_UP.title,
    value: StateTransitionEnum.IDENTITY_TOP_UP
  },
  {
    label: <TypeBadge typeId={StateTransitionEnum.DATA_CONTRACT_UPDATE}/>,
    title: TransactionTypesInfo.DATA_CONTRACT_UPDATE.title,
    value: StateTransitionEnum.DATA_CONTRACT_UPDATE
  },
  {
    label: <TypeBadge typeId={StateTransitionEnum.IDENTITY_UPDATE}/>,
    title: TransactionTypesInfo.IDENTITY_UPDATE.title,
    value: StateTransitionEnum.IDENTITY_UPDATE
  },
  {
    label: <TypeBadge typeId={StateTransitionEnum.IDENTITY_CREDIT_WITHDRAWAL}/>,
    title: TransactionTypesInfo.IDENTITY_CREDIT_WITHDRAWAL.title,
    value: StateTransitionEnum.IDENTITY_CREDIT_WITHDRAWAL
  },
  {
    label: <TypeBadge typeId={StateTransitionEnum.IDENTITY_CREDIT_TRANSFER}/>,
    title: TransactionTypesInfo.IDENTITY_CREDIT_TRANSFER.title,
    value: StateTransitionEnum.IDENTITY_CREDIT_TRANSFER
  },
  {
    label: <TypeBadge typeId={StateTransitionEnum.MASTERNODE_VOTE}/>,
    title: TransactionTypesInfo.MASTERNODE_VOTE.title,
    value: StateTransitionEnum.MASTERNODE_VOTE
  }
]

const STATUS_TYPES = [
  {
    label: <TransactionStatusBadge status={'SUCCESS'}/>,
    title: 'Success',
    value: 'SUCCESS'
  },
  {
    label: <TransactionStatusBadge status={'FAIL'}/>,
    title: 'Fail',
    value: 'FAIL'
  }
]

const FILTERS_CONFIG = {
  transaction_type: {
    type: 'multiselect',
    label: 'Type',
    title: 'Transaction Types',
    options: TRANSACTION_TYPES,
    defaultValue: TRANSACTION_TYPES.map(t => t.value),
    formatValue: (values) => {
      if (values.length === TRANSACTION_TYPES.length) return null
      if (values.length > 1) return `${values.length} categories`
      return TRANSACTION_TYPES.find(t => t.value === values[0])?.title || values[0]
    },
    isAllSelected: (values) => values.length === TRANSACTION_TYPES.length
  },
  status: {
    type: 'multiselect',
    label: 'Status',
    title: 'Status',
    options: STATUS_TYPES,
    defaultValue: STATUS_TYPES.map(s => s.value),
    formatValue: (values) => {
      if (values.length === STATUS_TYPES.length) return null
      if (values.length > 1) return `${values.length} values`
      return STATUS_TYPES.find(s => s.value === values[0])?.title || values[0]
    },
    isAllSelected: (values) => values.length === STATUS_TYPES.length
  },
  owner: {
    type: 'input',
    label: 'Owner',
    title: 'Identity Identifier',
    placeholder: 'Enter identity identifier',
    defaultValue: '',
    formatValue: (value) => value || null
  },
  gas: {
    type: 'range',
    label: 'Gas',
    title: 'Gas Range',
    defaultValue: { min: '', max: '' },
    minTitle: 'Minimum amount',
    minPlaceholder: 'ex. 0...',
    maxTitle: 'Maximum amount',
    maxPlaceholder: 'ex. 10000000...',
    formatValue: ({ min, max }) => {
      if (min && max) return `${min} - ${max} Credits`
      if (min) return `Min ${min} Credits`
      if (max) return `Max ${max} Credits`
      return null
    }
  }
}

export default function TransactionsFilter ({ initialFilters, onFilterChange, isMobile, className }) {
  const {
    filters,
    setFilters,
    handleFilterChange: baseHandleFilterChange,
    handleMultipleValuesChange: baseHandleMultipleValuesChange
  } = useFilters(
    Object.fromEntries(
      Object.keys(FILTERS_CONFIG).map(key => [
        key,
        initialFilters?.[key] ?? FILTERS_CONFIG[key].defaultValue
      ])
    )
  )

  useEffect(() => onFilterChange(filters), [filters, onFilterChange])

  /** Mobile state management */
  const { isOpen: mobileIsOpen, onOpen: mobileOnOpen, onClose: mobileOnClose } = useDisclosure()

  /** Handle single filter change */
  const handleFilterChange = useCallback((filterName, value) => {
    const newFilters = baseHandleFilterChange(filterName, value)
    setFilters(newFilters)
  }, [baseHandleFilterChange, setFilters])

  /** Handle multiple values filter change */
  const handleMultipleValuesChange = useCallback((fieldName, value) => {
    const newFilters = baseHandleMultipleValuesChange(fieldName, value)
    setFilters(newFilters)
  }, [baseHandleMultipleValuesChange, setFilters])

  /** Handle select all values for a filter */
  const handleSelectAll = useCallback((filterName) => {
    const config = FILTERS_CONFIG[filterName]
    if (config.type === 'multiselect') {
      const allValues = config.options.map(item => item.value)
      const newFilters = baseHandleFilterChange(filterName, allValues)
      setFilters(newFilters)
    }
  }, [baseHandleFilterChange, setFilters])

  const clearFilter = useCallback((filterName) => {
    const newFilters = {
      ...filters,
      [filterName]: FILTERS_CONFIG[filterName].defaultValue
    }
    setFilters(newFilters)
  }, [filters, setFilters])

  const menuData = Object.entries(FILTERS_CONFIG).map(([key, config]) => {
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

  return (<>
    <div className={`TransactionsFilter__ButtonsContainer ${className || ''}`}>
      <MultiLevelMenu
        placement={'bottom-start'}
        trigger={
          <Button
            className={'TransactionsFilter__Button'}
            onClick={() => mobileIsOpen ? mobileOnClose() : mobileOnOpen()}
            variant={'brand'}
            size={'sm'}
          >
            <span>Add Filter</span>
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
        allValuesSelected={(key, value) => FILTERS_CONFIG[key]?.isAllSelected?.(value) || false}
        formatValue={(key, value) => FILTERS_CONFIG[key]?.formatValue(value)}
        getFilterLabel={(key) => FILTERS_CONFIG[key]?.label || key}
      />
    </div>

    {isMobile &&
      <BottomSheet
        isOpen={mobileIsOpen}
        onClose={mobileOnClose}
        onOpen={mobileOnOpen}
        title={'Filters'}
      >
        Filters will be here
      </BottomSheet>
    }
  </>)
}
