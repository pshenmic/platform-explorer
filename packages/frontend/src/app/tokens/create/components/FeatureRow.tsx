'use client'

import type { KeyboardEvent, ReactNode } from 'react'
import { ValueContainer } from '@components/ui/containers'
import Tooltip from '@components/ui/Tooltips/Tooltip'
import './Features.css'
import './Essentials.css'

interface RowLabelProps {
  label: ReactNode
  tooltip: ReactNode
  width?: string | number
}

export const RowLabel = ({ label, tooltip, width }: RowLabelProps) => (
  <div className="Features__LabelWrap" style={width != null ? { width } : undefined}>
    <Tooltip content={tooltip} placement="top">
      <button type="button" className="Essentials__Label">
        {label}
      </button>
    </Tooltip>
  </div>
)

interface YesNoBadgeProps {
  value: boolean
  onToggle: () => void
}

export const YesNoBadge = ({ value, onToggle }: YesNoBadgeProps) => (
  <ValueContainer
    size="sm"
    colorScheme={value ? 'green' : 'red'}
    clickable
    onClick={onToggle}
    role="switch"
    aria-checked={!!value}
    tabIndex={0}
    onKeyDown={(e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onToggle()
      }
    }}
  >
    {value ? 'Yes' : 'No'}
  </ValueContainer>
)

interface FeatureToggleProps {
  label: ReactNode
  tooltip: ReactNode
  value: boolean
  onToggle: () => void
}

export const FeatureToggle = ({ label, tooltip, value, onToggle }: FeatureToggleProps) => (
  <div className="Features__Row">
    <RowLabel label={label} tooltip={tooltip} />
    <YesNoBadge value={value} onToggle={onToggle} />
  </div>
)
