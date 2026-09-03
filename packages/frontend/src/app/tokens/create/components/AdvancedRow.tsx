'use client'

import type { ReactNode } from 'react'
import { HStack, IconButton } from '@chakra-ui/react'
import { RowLabel } from './FeatureRow'

interface RowProps {
  label: ReactNode
  tooltip: ReactNode
  children?: ReactNode
}

export const Row = ({ label, tooltip, children }: RowProps) => (
  <HStack className="Advanced__Row" justify="space-between" spacing={3} align="center">
    <RowLabel label={label} tooltip={tooltip} />
    {children}
  </HStack>
)

interface GroupHeaderProps {
  label: ReactNode
  tooltip: ReactNode
  onAdd?: () => void
}

export const GroupHeader = ({ label, tooltip, onAdd }: GroupHeaderProps) => (
  <HStack className="Advanced__GroupHeader" justify="space-between" spacing={3} align="center">
    <RowLabel label={label} tooltip={tooltip} />
    {onAdd && (
      <IconButton
        size="xs"
        variant="outline"
        aria-label={`Add ${String(label)} row`}
        icon={<span style={{ fontSize: '14px', lineHeight: 1 }}>+</span>}
        onClick={onAdd}
      />
    )}
  </HStack>
)
