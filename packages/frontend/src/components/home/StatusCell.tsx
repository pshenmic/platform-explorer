import type { ReactNode } from 'react'
import Link from 'next/link'
import { InfoIcon } from '@chakra-ui/icons'
import { Tooltip } from '../ui/Tooltips'
import type { WithChildren } from '../../types'

interface StatusCellProps extends WithChildren {
  label: ReactNode
  hint?: ReactNode
  href?: string
}

// One cell of the hero status bar: label (+ optional i-tooltip) over a value (+ optional link).
export function StatusCell ({ label, hint, href, children }: StatusCellProps) {
  return (
    <div className={'HomeHero__StatusCell'}>
      <span className={'HomeHero__StatusHead'}>
        <span className={'HomeHero__StatusLabel'}>{label}</span>
        {hint &&
          <Tooltip title={label} content={hint} placement={'top'}>
            <span className={'HomeHero__StatusInfo'} aria-label={`About ${label}`}>
              <InfoIcon boxSize={2.5}/>
            </span>
          </Tooltip>}
      </span>
      <span className={'HomeHero__StatusValue'}>
        {href
          ? <Link href={href} className={'HomeHero__StatusLink'}>{children}</Link>
          : children}
      </span>
    </div>
  )
}
