'use client'

import {
  HStack, Text,
  Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverBody
} from '@chakra-ui/react'
import { ValueContainer } from '@components/ui/containers'

// The label word itself is the help trigger — click it to reveal the tooltip.
// No standalone help icons cluttering the rows.
export const RowLabel = ({ label, tooltip, width }) => (
  <HStack spacing={2} align='center' width={width} flexShrink={0}>
    <Popover trigger='click' placement='top' isLazy>
      <PopoverTrigger>
        <Text
          as='button'
          type='button'
          fontSize='12px'
          fontFamily='mono'
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
      <PopoverContent maxW='280px' fontSize='12px' fontFamily='var(--font-mono)'>
        <PopoverArrow/>
        <PopoverBody>{tooltip}</PopoverBody>
      </PopoverContent>
    </Popover>
  </HStack>
)

// Clickable Yes/No badge in the app's unified ValueContainer style
// (green Yes / red No), matching the token detail page flags.
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
