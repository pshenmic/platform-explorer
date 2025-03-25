import { useCallback, useEffect } from 'react'
import { Button, useDisclosure } from '@chakra-ui/react'
import { StateTransitionEnum } from '../../enums/state.transition.type'
import { useFilters } from '../../hooks'
import { MultiSelectFilter, InputFilter, RangeFilter, FilterGroup, ActiveFilters } from '../filters'
import { BottomSheet } from '../ui/sheets'
import { ChevronIcon } from '../ui/icons'
import { TransactionStatusBadge, TypeBadge } from './index'
import { MultiLevelMenu } from '../ui/menus'
import './TransactionsFilter.scss'

/** Transaction types list */
const TRANSACTION_TYPES = [
  { label: <TypeBadge typeId={StateTransitionEnum.DATA_CONTRACT_CREATE} />, value: StateTransitionEnum.DATA_CONTRACT_CREATE },
  { label: <TypeBadge typeId={StateTransitionEnum.DOCUMENTS_BATCH} />, value: StateTransitionEnum.DOCUMENTS_BATCH },
  { label: <TypeBadge typeId={StateTransitionEnum.IDENTITY_CREATE} />, value: StateTransitionEnum.IDENTITY_CREATE },
  { label: <TypeBadge typeId={StateTransitionEnum.IDENTITY_TOP_UP} />, value: StateTransitionEnum.IDENTITY_TOP_UP },
  { label: <TypeBadge typeId={StateTransitionEnum.DATA_CONTRACT_UPDATE} />, value: StateTransitionEnum.DATA_CONTRACT_UPDATE },
  { label: <TypeBadge typeId={StateTransitionEnum.IDENTITY_UPDATE} />, value: StateTransitionEnum.IDENTITY_UPDATE },
  { label: <TypeBadge typeId={StateTransitionEnum.IDENTITY_CREDIT_WITHDRAWAL} />, value: StateTransitionEnum.IDENTITY_CREDIT_WITHDRAWAL },
  { label: <TypeBadge typeId={StateTransitionEnum.IDENTITY_CREDIT_TRANSFER} />, value: StateTransitionEnum.IDENTITY_CREDIT_TRANSFER },
  { label: <TypeBadge typeId={StateTransitionEnum.MASTERNODE_VOTE} />, value: StateTransitionEnum.MASTERNODE_VOTE }
]

/** Status types list */
const STATUS_TYPES = [
  { label: <TransactionStatusBadge status={'SUCCESS'}/>, value: 'SUCCESS' },
  { label: <TransactionStatusBadge status={'FAIL'}/>, value: 'FAIL' }
]

/** Default filter values */
const defaultFilters = {
  status: STATUS_TYPES.map(s => s.value),
  transaction_type: TRANSACTION_TYPES.map(t => t.value),
  owner: '',
  gas: { min: '', max: '' }
}

const getFilterLabel = (filterName) => {
  switch (filterName) {
    case 'transaction_type':
      return 'Type'
    case 'status':
      return 'Status'
    case 'owner':
      return 'Owner'
    case 'gas':
      return 'Gas'
    default:
      return filterName
  }
}

const allValuesSelected = (key, value) => {
  if (key === 'transaction_type') {
    return value.length === TRANSACTION_TYPES.length
  }
  if (key === 'status') {
    return value.length === STATUS_TYPES.length
  }
  return false
}

const formatSpecialValues = (key, value) => {
  if (key === 'gas') {
    const { min, max } = value

    if (min && max) return `${min} - ${max} Credits`
    if (min) return `Min ${min} Credits`
    if (max) return `Max ${max} Credits`

    return null
  }

  if (Array.isArray(value)) {
    if (value.length > 1) {
      return `${value.length} values`
    }

    if (key === 'transaction_type') {
      return TRANSACTION_TYPES.find(t => t.value === value[0])?.label || value[0]
    }
    if (key === 'status') {
      return STATUS_TYPES.find(t => t.value === value[0])?.label || value[0]
    }
    return value[0]
  }

  return value
}

export default function TransactionsFilter ({ initialFilters, onFilterChange, isMobile, className }) {
  const {
    filters,
    setFilters,
    handleFilterChange: baseHandleFilterChange,
    handleMultipleValuesChange: baseHandleMultipleValuesChange
  } = useFilters({
    status: initialFilters?.status ?? defaultFilters.status,
    transaction_type: initialFilters?.transaction_type ?? defaultFilters.transaction_type,
    owner: initialFilters?.owner ?? defaultFilters.owner,
    gas: initialFilters?.gas ?? defaultFilters.gas
  })

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

  /** Handle select all transaction types */
  const handleClearTypes = useCallback(() => {
    const allTypes = TRANSACTION_TYPES.map(t => t.value)
    const newFilters = baseHandleFilterChange('transaction_type', allTypes)
    setFilters(newFilters)
  }, [baseHandleFilterChange, setFilters])

  /** Handle filter clear */
  const handleClearFilter = useCallback((filterName) => {
    const newFilters = {
      ...filters,
      [filterName]: defaultFilters[filterName]
    }
    setFilters(newFilters)
  }, [filters, setFilters])

  const menuData = [
    {
      label: 'Transaction type',
      content: (
        <FilterGroup title={'Transaction Types'}>
          <MultiSelectFilter
            items={TRANSACTION_TYPES}
            selectedValues={filters.transaction_type}
            onItemClick={(value) => handleMultipleValuesChange('transaction_type', value)}
            onSelectAll={handleClearTypes}
          />
        </FilterGroup>
      )
    },
    {
      label: 'Gas limits',
      content: (
        <FilterGroup title={'Gas Range'}>
          <RangeFilter
            value={filters.gas}
            onChange={(value) => handleFilterChange('gas', value)}
            type={'number'}
            minTitle={'Minimum amount'}
            minPlaceholder={'ex. 0...'}
            maxTitle={'Maximum amount'}
            maxPlaceholder={'ex. 10000000...'}
          />
        </FilterGroup>
      )
    },
    {
      label: 'Status',
      content: (
        <FilterGroup title={'Status'}>
          <MultiSelectFilter
            items={STATUS_TYPES}
            selectedValues={filters.status}
            onItemClick={(value) => handleMultipleValuesChange('status', value)}
            onSelectAll={() => handleFilterChange('status', STATUS_TYPES.map(s => s.value))}
            showSelectAll={true}
          />
        </FilterGroup>
      )
    },
    {
      label: 'Owner',
      content: (
        <FilterGroup title={'Identity Identifier'}>
          <InputFilter
            value={filters.owner}
            onChange={(value) => handleFilterChange('owner', value)}
            placeholder='Enter identity identifier'
          />
        </FilterGroup>
      )
    }
  ]

  return (<>
    <div className={`TransactionsFilter__ButtonsContainer ${className || ''}`}>
      <MultiLevelMenu
        // onClose={() => {}}
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

      <ActiveFilters
        filters={filters}
        onClearFilter={handleClearFilter}
        allValuesSelected={allValuesSelected}
        formatValue={formatSpecialValues}
        getFilterLabel={getFilterLabel}
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
