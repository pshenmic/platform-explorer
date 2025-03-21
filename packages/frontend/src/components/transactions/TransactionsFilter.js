import { useCallback } from 'react'
import { Box, Button, useDisclosure } from '@chakra-ui/react'
import { StateTransitionEnum } from '../../enums/state.transition.type'
import { useFilters } from '../../hooks/useFilters'
import { MultiSelectFilter, InputFilter, RangeFilter } from '../filters'
import { BottomSheet } from '../ui/sheets'
import { ChevronIcon } from '../ui/icons'
import './TransactionsFilter.scss'

const TRANSACTION_TYPES = [
  { label: 'DATA CONTRACT CREATE', value: StateTransitionEnum.DATA_CONTRACT_CREATE },
  { label: 'DOCUMENTS BATCH', value: StateTransitionEnum.DOCUMENTS_BATCH },
  { label: 'IDENTITY CREATE', value: StateTransitionEnum.IDENTITY_CREATE },
  { label: 'IDENTITY TOP UP', value: StateTransitionEnum.IDENTITY_TOP_UP },
  { label: 'DATA CONTRACT UPDATE', value: StateTransitionEnum.DATA_CONTRACT_UPDATE },
  { label: 'IDENTITY UPDATE', value: StateTransitionEnum.IDENTITY_UPDATE },
  { label: 'IDENTITY CREDIT WITHDRAWAL', value: StateTransitionEnum.IDENTITY_CREDIT_WITHDRAWAL },
  { label: 'IDENTITY CREDIT TRANSFER', value: StateTransitionEnum.IDENTITY_CREDIT_TRANSFER },
  { label: 'MASTERNODE VOTE', value: StateTransitionEnum.MASTERNODE_VOTE }
]

const STATUS_TYPES = [
  { label: 'Success', value: 'SUCCESS' },
  { label: 'Failed', value: 'FAIL' }
]

const defaultFilters = {
  status: [],
  transaction_type: [],
  owner: '',
  gas_min: '',
  gas_max: ''
}

const FilterContent = ({ filters, handleFilterChange, handleMultipleValuesChange, handleClearTypes, onFilterChange }) => (
  <form onSubmit={(e) => {
    e.preventDefault()
    onFilterChange(filters)
  }}>
    <MultiSelectFilter
      title="Transaction Types"
      items={TRANSACTION_TYPES}
      selectedValues={filters.transaction_type}
      onItemClick={(value) => handleMultipleValuesChange('transaction_type', value)}
      onSelectAll={handleClearTypes}
    />

    <MultiSelectFilter
      title="Status"
      items={STATUS_TYPES}
      selectedValues={filters.status}
      onItemClick={(value) => handleMultipleValuesChange('status', value)}
      onSelectAll={() => handleFilterChange('status', STATUS_TYPES.map(s => s.value))}
      showSelectAll={true}
    />

    <InputFilter
      title="Identity Identifier"
      value={filters.owner}
      onChange={(value) => handleFilterChange('owner', value)}
      placeholder="Enter identity identifier"
    />

    <RangeFilter
      title="Gas Range"
      minValue={filters.gas_min}
      maxValue={filters.gas_max}
      onMinChange={(value) => handleFilterChange('gas_min', value)}
      onMaxChange={(value) => handleFilterChange('gas_max', value)}
      type="number"
      minPlaceholder="Min gas"
      maxPlaceholder="Max gas"
    />

    <Button
      mt={4}
      colorScheme="blue"
      width="100%"
      type="submit"
    >
      Apply Filters
    </Button>
  </form>
)

export default function TransactionsFilter ({ initialFilters, onFilterChange, isMobile, className }) {
  /** Filter state */
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

  /** Mobile state */
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleClose = useCallback(() => {
    setTimeout(onClose, 200)
  }, [onClose])

  const handleOpen = useCallback(() => {
    onOpen()
  }, [onOpen])

  const handleFilterChange = useCallback((filterName, value) => {
    const newFilters = baseHandleFilterChange(filterName, value)
    setFilters(newFilters)
  }, [baseHandleFilterChange, setFilters])

  const handleMultipleValuesChange = useCallback((fieldName, value) => {
    const newFilters = baseHandleMultipleValuesChange(fieldName, value)
    setFilters(newFilters)
  }, [baseHandleMultipleValuesChange, setFilters])

  const handleClearTypes = useCallback(() => {
    const allTypes = TRANSACTION_TYPES.map(t => t.value)
    const newFilters = baseHandleFilterChange('transaction_type', allTypes)
    setFilters(newFilters)
  }, [baseHandleFilterChange, setFilters])

  return (<>
    <div className={`TransactionsFilter__ButtonsContainer ${className || ''}`}>
      <Button
        className={'TransactionsFilter__OpenButton'}
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
          />
        </BottomSheet>
      : isOpen &&
          <Box
            p={4}
            borderWidth="1px"
            borderRadius="lg"
            className="TransactionsFilter"
            maxW={'100%'}
          >
            <FilterContent
              filters={filters}
              handleFilterChange={handleFilterChange}
              handleMultipleValuesChange={handleMultipleValuesChange}
              handleClearTypes={handleClearTypes}
              onFilterChange={onFilterChange}
            />
          </Box>
    }
  </>)

  // if (isMobile) {
  //   return (
  //     <>
  //       <Button className={'TransactionsFilter__OpenButton'} onClick={handleOpen} variant={'brand'} size={'sm'}>
  //         <span>Add Filter</span>
  //         <ChevronIcon css={{
  //           transition: '.1s',
  //           transform: isOpen ? 'rotate(-90deg)' : 'rotate(90deg)'
  //         }}/>
  //       </Button>
  //
  //       <BottomSheet
  //         isOpen={isOpen}
  //         onClose={onClose}
  //         onOpen={onOpen}
  //         title={'Filters'}
  //       >
  //         <FilterContent
  //           filters={filters}
  //           handleFilterChange={handleFilterChange}
  //           handleMultipleValuesChange={handleMultipleValuesChange}
  //           handleClearTypes={handleClearTypes}
  //           onFilterChange={(newFilters) => {
  //             onFilterChange(newFilters)
  //             handleClose()
  //           }}
  //         />
  //       </BottomSheet>
  //     </>
  //   )
  // }
  //
  // return (
  //   <Box
  //     p={4}
  //     borderWidth="1px"
  //     borderRadius="lg"
  //     className="TransactionsFilter"
  //     maxW={'100%'}
  //   >
  //     <FilterContent
  //       filters={filters}
  //       handleFilterChange={handleFilterChange}
  //       handleMultipleValuesChange={handleMultipleValuesChange}
  //       handleClearTypes={handleClearTypes}
  //       onFilterChange={onFilterChange}
  //     />
  //   </Box>
  // )
}
