import { useState, useEffect } from 'react'
import { Box, Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, useDisclosure, Select, Text, HStack } from '@chakra-ui/react'
import { useSpring, animated } from 'react-spring'
import { useDrag } from '@use-gesture/react'
import './TransactionsFilter.scss'
import { StateTransitionEnum } from '../../enums/state.transition.type'

const DRAWER_HEIGHT = '50vh'
// const DRAG_THRESHOLD = 50

const TRANSACTION_TYPES = [
  { label: 'DATA_CONTRACT_CREATE', value: StateTransitionEnum.DATA_CONTRACT_CREATE },
  { label: 'DOCUMENTS_BATCH', value: StateTransitionEnum.DOCUMENTS_BATCH },
  { label: 'IDENTITY_CREATE', value: StateTransitionEnum.IDENTITY_CREATE },
  { label: 'IDENTITY_TOP_UP', value: StateTransitionEnum.IDENTITY_TOP_UP },
  { label: 'DATA_CONTRACT_UPDATE', value: StateTransitionEnum.DATA_CONTRACT_UPDATE },
  { label: 'IDENTITY_UPDATE', value: StateTransitionEnum.IDENTITY_UPDATE },
  { label: 'IDENTITY_CREDIT_WITHDRAWAL', value: StateTransitionEnum.IDENTITY_CREDIT_WITHDRAWAL },
  { label: 'IDENTITY_CREDIT_TRANSFER', value: StateTransitionEnum.IDENTITY_CREDIT_TRANSFER },
  { label: 'MASTERNODE_VOTE', value: StateTransitionEnum.MASTERNODE_VOTE }
]

const STATUS_TYPES = [
  'ALL',
  'SUCCESS',
  'FAIL'
]

const TIME_RANGES = [
  'all',
  'today',
  'week',
  'month',
  'year'
]

export default function TransactionsFilter ({ defaultFilters, onFilterChange, isMobile }) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [{ y }, api] = useSpring(() => ({ y: 0 }))
  const [filters, setFilters] = useState({
    status: defaultFilters.status || 'ALL',
    selectedTypes: defaultFilters.type
      ? [parseInt(defaultFilters.type)].filter(t => !isNaN(t))
      : TRANSACTION_TYPES.map(t => t.value),
    owner: defaultFilters.owner || '',
    gas_min: defaultFilters.gas_min || '',
    gas_max: defaultFilters.gas_max || ''
  })

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

  const handleFilterChange = (filterName, value) => {
    const newFilters = {
      ...filters,
      [filterName]: value
    }
    setFilters(newFilters)
    const filterParams = prepareFilters(newFilters)
    onFilterChange(filterParams)
  }

  const handleTypesChange = (typeValue) => {
    const newTypes = filters.selectedTypes.includes(typeValue)
      ? filters.selectedTypes.filter(t => t !== typeValue)
      : [...filters.selectedTypes, typeValue]

    setFilters(prev => ({
      ...prev,
      selectedTypes: newTypes
    }))

    const filterParams = prepareFilters({
      ...filters,
      selectedTypes: newTypes
    })
    onFilterChange(filterParams)
  }

  const handleClearTypes = () => {
    const allTypes = TRANSACTION_TYPES.map(t => t.value)
    const newFilters = {
      ...filters,
      selectedTypes: allTypes
    }
    setFilters(newFilters)
    const filterParams = prepareFilters(newFilters)
    onFilterChange(filterParams)
  }

  // Функция подготовки фильтров
  const prepareFilters = (filters) => {
    const filterParams = {
      status: filters.status !== 'ALL' ? filters.status : '',
      owner: filters.owner,
      gas_min: filters.gas_min || '',
      gas_max: filters.gas_max || '',
      transaction_type: filters.selectedTypes
    }

    // Удаляем пустые значения
    Object.keys(filterParams).forEach(key => {
      if (filterParams[key] === '') {
        delete filterParams[key]
      }
    })

    return filterParams
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

  const FilterSection = ({ title, options, value, onChange }) => (
    <Box mb={4}>
      <Text mb={2} fontWeight="bold">{title}</Text>
      <HStack flexWrap={'wrap'} spacing={2}>
        {options.map(option => (
          <FilterButton
            key={option}
            isActive={value === option}
            onClick={() => onChange(option)}
          >
            {option === 'all' ? 'All' : option}
          </FilterButton>
        ))}
      </HStack>
    </Box>
  )

  const TypesFilterSection = () => (
    <Box mb={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Text fontWeight="bold">Transaction Types</Text>
        <Button
          size="sm"
          variant="outline"
          onClick={handleClearTypes}
        >
          Select All
        </Button>
      </Box>
      <Box display="flex" flexWrap="wrap" gap={2}>
        {TRANSACTION_TYPES.map(({ label, value }) => (
          <Button
            key={value}
            size="sm"
            variant={filters.selectedTypes.includes(value) ? 'solid' : 'outline'}
            colorScheme={filters.selectedTypes.includes(value) ? 'blue' : 'gray'}
            onClick={() => handleTypesChange(value)}
          >
            {label}
          </Button>
        ))}
      </Box>
    </Box>
  )

  const FilterContent = () => (
    <>
      <TypesFilterSection />

      <FilterSection
        title="Status"
        options={STATUS_TYPES}
        value={filters.status}
        onChange={(value) => handleFilterChange('status', value)}
      />

      <FilterSection
        title="Time Range"
        options={TIME_RANGES}
        value={filters.timeRange}
        onChange={(value) => handleFilterChange('timeRange', value)}
      />

      <Box mb={4}>
        <Text mb={2} fontWeight="bold">Identity Identifier</Text>
        <input
          type="text"
          value={filters.owner}
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
              value={filters.gas_min}
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
              value={filters.gas_max}
              onChange={(e) => handleFilterChange('gas_max', e.target.value)}
              placeholder="Max gas"
              className="TransactionsFilter__Input"
              min="0"
            />
          </Box>
        </HStack>
      </Box>

      <Select
        value={filters.status}
        onChange={(e) => handleFilterChange('status', e.target.value)}
        placeholder="Select status"
        className="TransactionsFilter__Select"
      >
        {STATUS_TYPES.map(status => (
          <option key={status} value={status}>
            {status === 'ALL' ? 'All' : status}
          </option>
        ))}
      </Select>
    </>
  )

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
      <FilterContent />
    </Box>
  )
}
