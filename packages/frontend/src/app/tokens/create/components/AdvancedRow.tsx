'use client'

import type { ReactNode } from 'react'
import { RowLabel } from './FeatureRow'

interface RowProps {
  label: ReactNode
  tooltip: ReactNode
  children?: ReactNode
}

export const Row = ({ label, tooltip, children }: RowProps) => (
  <div className="Advanced__Row">
    <RowLabel label={label} tooltip={tooltip} />
    {children}
  </div>
)

interface GroupHeaderProps {
  label: ReactNode
  tooltip: ReactNode
  onAdd?: () => void
}

export const GroupHeader = ({ label, tooltip, onAdd }: GroupHeaderProps) => (
  <div className="Advanced__GroupHeader">
    <RowLabel label={label} tooltip={tooltip} />
    {onAdd && (
      <button
        type="button"
        className="WizardIconBtn"
        aria-label={`Add ${String(label)} row`}
        onClick={onAdd}
      >
        +
      </button>
    )}
  </div>
)
