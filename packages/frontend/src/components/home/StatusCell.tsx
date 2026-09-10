'use client'

import type { KeyboardEvent, ReactNode } from 'react'
import Link from 'next/link'
import { Tooltip } from '../ui/Tooltips'

export function StatusCell({
  label,
  hint,
  href,
  children
}: {
  label: ReactNode
  hint?: ReactNode
  href?: string
  children?: ReactNode
}) {
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!hint) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      e.currentTarget.click()
    }
  }

  const cell = (
    <div
      className={`HomeHero__StatusCell${hint ? ' HomeHero__StatusCell--Hint' : ''}`}
      role={hint ? 'button' : undefined}
      tabIndex={hint ? 0 : undefined}
      aria-label={hint ? `${typeof label === 'string' ? label : 'KPI'}, show details` : undefined}
      onKeyDown={onKeyDown}
    >
      <span className={'HomeHero__StatusHead'}>
        <span className={'HomeHero__StatusLabel'}>{label}</span>
      </span>
      <span className={'HomeHero__StatusValue'}>
        {href ? (
          <Link href={href} className={'HomeHero__StatusLink'} onClick={e => e.stopPropagation()}>
            {children}
          </Link>
        ) : (
          children
        )}
      </span>
    </div>
  )

  if (!hint) return cell

  return (
    <Tooltip title={label} content={hint} placement={'top'}>
      {cell}
    </Tooltip>
  )
}
