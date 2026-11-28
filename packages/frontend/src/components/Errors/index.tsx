'use client'

import type { CSSProperties, ReactNode } from 'react'
import './ErrorMessageBlock.css'

interface ErrorMessageBlockProps {
  w?: string | number
  h?: string | number
  text?: ReactNode
  warningIcon?: boolean
  onRetry?: () => void
  inline?: boolean
}

function ErrorMessageBlock({
  w = '100%',
  h,
  text,
  warningIcon = true,
  onRetry,
  inline = false
}: ErrorMessageBlockProps) {
  const height = h ?? (inline ? 'auto' : '100%')
  const style: CSSProperties = {
    width: typeof w === 'number' ? `${w}px` : w,
    height: typeof height === 'number' ? `${height}px` : height
  }

  return (
    <div className={`ErrorMessageBlock${inline ? ' ErrorMessageBlock--Inline' : ''}`} style={style}>
      <div className={'ErrorMessageBlock__Inner'}>
        {warningIcon && (
          <svg
            className={'ErrorMessageBlock__Icon'}
            width={'16'}
            height={'16'}
            viewBox={'0 0 24 24'}
            fill={'none'}
            aria-hidden={'true'}
          >
            <path
              d={'M12 3.5L2.5 20h19L12 3.5z'}
              stroke={'currentColor'}
              strokeWidth={'1.5'}
              strokeLinejoin={'round'}
            />
            <path
              d={'M12 10v5'}
              stroke={'currentColor'}
              strokeWidth={'1.5'}
              strokeLinecap={'round'}
            />
            <circle cx={'12'} cy={'17.5'} r={'1'} fill={'currentColor'} />
          </svg>
        )}
        {text || 'Error loading data'}
        {onRetry && (
          <button type={'button'} className={'ErrorMessageBlock__Retry'} onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    </div>
  )
}

export { ErrorMessageBlock }
