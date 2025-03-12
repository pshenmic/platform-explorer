import { useState, useEffect } from 'react'
import { Box, Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, useDisclosure, Select, Text, HStack } from '@chakra-ui/react'
import { useSpring, animated } from 'react-spring'
import { useDrag } from '@use-gesture/react'
import './TransactionsFilter.scss'

const DRAWER_HEIGHT = '50vh'
const DRAG_THRESHOLD = 50

const TRANSACTION_TYPES = [
  'all',
  'DATA_CONTRACT_CREATE',
  'DOCUMENTS_BATCH',
  'IDENTITY_CREATE',
  'IDENTITY_TOP_UP',
  'DATA_CONTRACT_UPDATE',
  'IDENTITY_UPDATE',
  'IDENTITY_CREDIT_WITHDRAWAL',
  'IDENTITY_CREDIT_TRANSFER',
  'MASTERNODE_VOTE'
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

export default function TransactionsFilter({ onFilterChange, isMobile }) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [{ y }, api] = useSpring(() => ({ y: 0 }))
  const [filters, setFilters] = useState({
    timeRange: 'all',
    status: 'ALL',
    type: 'all'
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
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }))
    onFilterChange({
      ...filters,
      [filterName]: value
    })
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

  const FilterContent = () => (
    <>
      <FilterSection
        title="Transaction Type"
        options={TRANSACTION_TYPES}
        value={filters.type}
        onChange={(value) => handleFilterChange('type', value)}
      />

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
