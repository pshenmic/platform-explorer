import type { ReactNode } from 'react'
import type { WithClassName } from '../../types/common'
import './ValueBlock.css'

interface ValueBlockProps extends WithClassName {
  title?: ReactNode
  value?: ReactNode
  icon?: string | null
  formats?: string[]
  event?: string | null
}

export default function ValueBlock({
  title,
  value,
  icon,
  formats = [],
  event = null,
  className
}: ValueBlockProps) {
  const iconClass = `ValueBlock--${icon}`
  const eventClasses: Record<string, string> = {
    christmas: 'ValueBlock--Christmas'
  }

  const formatClass = formats
    .map(format => {
      if (format === 'elipsed') return 'ValueBlock__Value--Elipsed'
      return ''
    })
    .join(' ')

  return (
    <div
      className={`ValueBlock ${iconClass || ''} ${className || ''} ${event ? eventClasses[event] || '' : ''}`}
    >
      {icon && <div className={'ValueBlock__Icon'}></div>}
      {title && <div className={'ValueBlock__Title'}>{title}</div>}
      {value && <div className={`ValueBlock__Value ${formatClass}`}>{value}</div>}
    </div>
  )
}
