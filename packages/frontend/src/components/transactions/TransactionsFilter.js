import { useEffect, useCallback } from 'react'
import { Box, Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, useDisclosure, Select, Text, HStack } from '@chakra-ui/react'
import { useSpring, animated } from 'react-spring'
import { useDrag } from '@use-gesture/react'
import { StateTransitionEnum } from '../../enums/state.transition.type'
import { useFilters } from '../../hooks/useFilters'
import { MultiSelectFilter } from '../filters'
import './TransactionsFilter.scss'

const DRAWER_HEIGHT = '50vh'
// const DRAG_THRESHOLD = 50

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

const FilterButton = ({ children, isActive, onClick }) => (
  <Button
    variant={isActive ? 'solid' : 'outline'}
    colorScheme={isActive ? 'blue' : 'gray'}
    onClick={onClick}
  >
    {children}
  </Button>
)

// const FilterSection = ({ title, options, value, onChange }) => (
//   <Box mb={4}>
//     <Text mb={2} fontWeight="bold">{title}</Text>
//     <HStack flexWrap={'wrap'} spacing={2}>
//       {options.map(option => (
//         <FilterButton
//           key={option}
//           isActive={value === option}
//           onClick={() => onChange(option)}
//         >
//           {option === 'all' ? 'All' : option}
//         </FilterButton>
//       ))}
//     </HStack>
//   </Box>
// )

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
      // showSelectAll={true}
    />

    <Box mb={4}>
      <Text mb={2} fontWeight="bold">Owner id</Text>
      <input
        type="text"
        value={filters.owner || ''}
        onChange={(e) => handleFilterChange('owner', e.target.value)}
        placeholder="Enter identity identifier"
        className="TransactionsFilter__Input"
      />
    </Box>

    <Box mb={4}>
      <Text mb={2} fontWeight="bold">Gas Range</Text>
      <HStack spacing={4}>
        <Box>
          <Text fontSize="sm">Min</Text>
          <input
            type="number"
            value={filters.gas_min || ''}
            onChange={(e) => handleFilterChange('gas_min', e.target.value)}
            placeholder="Min gas"
            className="TransactionsFilter__Input"
            min="0"
          />
        </Box>
        <Box>
          <Text fontSize="sm">Max</Text>
          <input
            type="number"
            value={filters.gas_max || ''}
            onChange={(e) => handleFilterChange('gas_max', e.target.value)}
            placeholder="Max gas"
            className="TransactionsFilter__Input"
            min="0"
          />
        </Box>
      </HStack>
    </Box>

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

export default function TransactionsFilter ({ initialFilters, onFilterChange, isMobile }) {
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
  const [{ y }, api] = useSpring(() => ({ y: 0 }))

  const bind = useDrag(({ movement: [unused1, moveY], direction: [unused2, dirY], velocity: [unused3, velY] }) => {
    const open = moveY > 0
    api.start({ y: open ? 200 : 0, immediate: false })
    if (velY > 0.5 && dirY > 0) api.start({ y: 200, immediate: true })
    if (velY > 0.5 && dirY < 0) api.start({ y: 0, immediate: true })
  }, { axis: 'y', bounds: { top: 0 } })

  useEffect(() => {
    return () => {
      api.stop()
    }
  }, [api])

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

  if (isMobile) {
    return (
      <>
        <Button onClick={onOpen} variant="outline" size="sm">
          Filter
        </Button>

        <Drawer
          isOpen={isOpen}
          placement="bottom"
          onClose={onClose}
          size="full"
          className="TransactionsFilter__Drawer"
        >
          <DrawerOverlay />
          <DrawerContent
            borderTopRadius="20px"
            maxHeight={DRAWER_HEIGHT}
            {...bind()}
            as={animated.div}
            style={{
              y,
              touchAction: 'none'
            }}
          >
            <DrawerHeader borderBottomWidth="1px">
              <div className="TransactionsFilter__DragHandle" />
              Filters
            </DrawerHeader>
            <DrawerBody>
              <FilterContent />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </>
    )
  }

  return (
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
  )
}