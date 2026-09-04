'use client'

import type { ReactNode } from 'react'
import Tooltip from '@components/ui/Tooltips/Tooltip'

function HelpPopover({ children }: { children?: ReactNode }) {
  return (
    <Tooltip content={children} placement="top">
      <button
        type="button"
        aria-label="Help"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: 'none',
          border: 0,
          padding: 0,
          cursor: 'pointer',
          color: 'var(--pe-color-fg-muted)',
          fontSize: '0.75rem'
        }}
      >
        i
      </button>
    </Tooltip>
  )
}

export default HelpPopover
