'use client'

import {
  HStack, Text,
  Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverBody
} from '@chakra-ui/react'
import { ValueContainer } from '@components/ui/containers'

export const RowLabel = ({ label, tooltip, width }) => (
  <HStack spacing={2} align='center' width={width} flexShrink={0}>
    <Popover trigger='click' placement='top' isLazy>
      <PopoverTrigger>
        <Text
          as='button'
          type='button'
          fontSize='0.75rem'
          fontWeight='600'
          fontFamily='var(--font-body)'
          color='var(--chakra-colors-white-100)'
          sx={{
            background: 'transparent',
            border: 'none',
            borderBottom: '1px dashed var(--chakra-colors-gray-500)',
            padding: 0,
            cursor: 'help'
          }}
        >
          {label}
        </Text>
      </PopoverTrigger>
      <PopoverContent maxW='280px' fontSize='0.75rem' fontFamily='var(--font-body)'>
        <PopoverArrow/>
        <PopoverBody>{tooltip}</PopoverBody>
      </PopoverContent>
    </Popover>
  </HStack>
)

export const YesNoBadge = ({ value, onToggle }) => (
  <ValueContainer
    size='sm'
    colorScheme={value ? 'green' : 'red'}
    clickable
    onClick={onToggle}
    role='switch'
    aria-checked={!!value}
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onToggle()
      }
    }}
  >
    {value ? 'Yes' : 'No'}
  </ValueContainer>
)

export const FeatureToggle = ({ label, tooltip, value, onToggle }) => (
  <HStack className='Features__Row' justify='space-between' spacing={3}>
    <RowLabel label={label} tooltip={tooltip}/>
    <YesNoBadge value={value} onToggle={onToggle}/>
  </HStack>
)
