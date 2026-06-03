'use client'

import { HStack, IconButton } from '@chakra-ui/react'
import { RowLabel } from './FeatureRow'

export const Row = ({ label, tooltip, children }) => (
  <HStack className='Advanced__Row' justify='space-between' spacing={3} align='center'>
    <RowLabel label={label} tooltip={tooltip}/>
    {children}
  </HStack>
)

export const GroupHeader = ({ label, tooltip, onAdd }) => (
  <HStack className='Advanced__GroupHeader' justify='space-between' spacing={3} align='center'>
    <RowLabel label={label} tooltip={tooltip}/>
    {onAdd && (
      <IconButton
        size='xs'
        variant='outline'
        aria-label={`Add ${label} row`}
        icon={<span style={{ fontSize: '14px', lineHeight: 1 }}>+</span>}
        onClick={onAdd}
      />
    )}
  </HStack>
)
