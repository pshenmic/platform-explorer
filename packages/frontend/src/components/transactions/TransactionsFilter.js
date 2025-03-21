import { useCallback } from 'react'
import { Box, Button, useDisclosure } from '@chakra-ui/react'
import { StateTransitionEnum } from '../../enums/state.transition.type'
import { useFilters } from '../../hooks/useFilters'
import { MultiSelectFilter, InputFilter, RangeFilter, FilterGroup } from '../filters'
import { BottomSheet } from '../ui/sheets'
import { ChevronIcon, CloseIcon } from '../ui/icons'
import { TransactionStatusBadge, TypeBadge } from './index'
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
  gas_min: '',
  gas_max: ''
}

/** Filter forms content component */
const FilterContent = ({ filters, handleFilterChange, handleMultipleValuesChange, handleClearTypes, onFilterChange, onClose }) => (
  <form onSubmit={(e) => {
    e.preventDefault()
    onFilterChange(filters)
    onClose()
  }}>
    <FilterGroup title={'Transaction Types'}>
      <MultiSelectFilter
        items={TRANSACTION_TYPES}
        selectedValues={filters.transaction_type}
        onItemClick={(value) => handleMultipleValuesChange('transaction_type', value)}
        onSelectAll={handleClearTypes}
      />
    </FilterGroup>

    <FilterGroup title={'Status'}>
      <MultiSelectFilter
        items={STATUS_TYPES}
        selectedValues={filters.status}
        onItemClick={(value) => handleMultipleValuesChange('status', value)}
        onSelectAll={() => handleFilterChange('status', STATUS_TYPES.map(s => s.value))}
        showSelectAll={true}
      />
    </FilterGroup>

    <FilterGroup title={'Identity Identifier'}>
      <InputFilter
        value={filters.owner}
        onChange={(value) => handleFilterChange('owner', value)}
        placeholder='Enter identity identifier'
      />
    </FilterGroup>

    <FilterGroup title={'Gas Range'}>
      <RangeFilter
        minValue={filters.gas_min}
        maxValue={filters.gas_max}
        onMinChange={(value) => handleFilterChange('gas_min', value)}
        onMaxChange={(value) => handleFilterChange('gas_max', value)}
        type={'number'}
        minTitle={'Minimum amount'}
        minPlaceholder={'ex. 0...'}
        maxTitle={'Maximum amount'}
        maxPlaceholder={'ex. 10000000...'}
      />
    </FilterGroup>

    <Button
      mt={4}
      colorScheme='blue'
      width='100%'
      type='submit'
    >
      Apply Filters
    </Button>
  </form>
)

/** Get human readable filter label */
const getFilterLabel = (filterName) => {
  switch (filterName) {
    case 'transaction_type':
      return 'Type'
    case 'status':
      return 'Status'
    case 'owner':
      return 'Identity'
    case 'gas_min':
    case 'gas_max':
      return 'Gas'
    default:
      return filterName
  }
}

/** Active filters display component */
const ActiveFilters = ({ filters, onClearFilter }) => {
  /** Check if all values are selected for a filter */
  const isAllSelected = (key, value) => {
    if (key === 'transaction_type') {
      return value.length === TRANSACTION_TYPES.length
    }
    if (key === 'status') {
      return value.length === STATUS_TYPES.length
    }
    return false
  }

  /** Filter out inactive and fully selected filters */
  const activeFilters = Object.entries(filters).filter(([key, value]) => {
    if (Array.isArray(value)) {
      return value.length > 0 && !isAllSelected(key, value)
    }
    return value !== '' && value !== undefined
  })

  if (activeFilters.length === 0) return null

  /** Format filter value for display */
  const formatValue = (key, value) => {
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

    if (key === 'gas_min' || key === 'gas_max') {
      return `${key === 'gas_min' ? 'from' : 'to'} ${value}`
    }
    return value
  }

  return (
    <Box display={'flex'} flexWrap={'wrap'} gap={2} mb={4}>
      {activeFilters.map(([key, value]) => (
        <Button
          key={key}
          size={'sm'}
          variant={'gray'}
          rightIcon={
            <CloseIcon
              boxSize={2}
              cursor={'pointer'}
              onClick={(e) => {
                e.stopPropagation()
                onClearFilter(key)
              }}
            />
          }
        >
          {getFilterLabel(key)}: {formatValue(key, value)}
        </Button>
      ))}
    </Box>
  )
}

/** Main transactions filter component */
export default function TransactionsFilter ({ initialFilters, onFilterChange, isMobile, className }) {
  /** Filter state initialization */
  const {
    filters,
    setFilters,
    handleFilterChange: baseHandleFilterChange,
    handleMultipleValuesChange: baseHandleMultipleValuesChange
  } = useFilters({
    status: initialFilters?.status ?? defaultFilters.status,
    transaction_type: initialFilters?.transaction_type ?? defaultFilters.transaction_type,
    owner: initialFilters?.owner ?? defaultFilters.owner,
    gas_min: initialFilters?.gas_min ?? defaultFilters.gas_min,
    gas_max: initialFilters?.gas_max ?? defaultFilters.gas_max
  })

  /** Mobile state management */
  const { isOpen, onOpen, onClose } = useDisclosure()

  /** Handle mobile sheet close with delay */
  const handleClose = useCallback(() => {
    setTimeout(onClose, 200)
  }, [onClose])

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
    const newFilters = baseHandleFilterChange(filterName,
      Array.isArray(filters[filterName]) ? [] : ''
    )
    setFilters(newFilters)
    onFilterChange(newFilters)
  }, [baseHandleFilterChange, filters, setFilters, onFilterChange])

  return (<>
    <div className={`TransactionsFilter__ButtonsContainer ${className || ''}`}>
      <Button
        className={'TransactionsFilter__Button'}
        onClick={() => isOpen ? onClose() : onOpen()}
        variant={'brand'}
        size={'sm'}
      >
        <span>Add Filter</span>
        <ChevronIcon css={{
          transition: '.1s',
          transform: isOpen ? 'rotate(-90deg)' : 'rotate(90deg)'
        }}/>
      </Button>

      <ActiveFilters
        filters={filters}
        onClearFilter={handleClearFilter}
      />
    </div>

    {isMobile
      ? <BottomSheet
          isOpen={isOpen}
          onClose={onClose}
          onOpen={onOpen}
          title={'Filters'}
        >
          <FilterContent
            filters={filters}
            handleFilterChange={handleFilterChange}
            handleMultipleValuesChange={handleMultipleValuesChange}
            handleClearTypes={handleClearTypes}
            onFilterChange={(newFilters) => {
              onFilterChange(newFilters)
              handleClose()
            }}
            onClose={onClose}
          />
        </BottomSheet>
      : !isOpen &&
        <Box
          p={4}
          borderWidth='1px'
          borderRadius='lg'
          className='TransactionsFilter'
          maxW={'100%'}
        >
          <FilterContent
            filters={filters}
            handleFilterChange={handleFilterChange}
            handleMultipleValuesChange={handleMultipleValuesChange}
            handleClearTypes={handleClearTypes}
            onFilterChange={onFilterChange}
            onClose={onClose}
          />
        </Box>
    }
  </>)
}
