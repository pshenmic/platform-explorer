import type { CSSProperties, ReactNode } from 'react'
import './ErrorMessageBlock.css'

interface ErrorMessageBlockProps {
  w?: string | number
  h?: string | number
  text?: ReactNode
  warningIcon?: boolean
}

function ErrorMessageBlock({
  w = '100%',
  h = '100%',
  text,
  warningIcon = true
}: ErrorMessageBlockProps) {
  const style: CSSProperties = {
    width: typeof w === 'number' ? `${w}px` : w,
    height: typeof h === 'number' ? `${h}px` : h
  }

  return (
    <div className={'ErrorMessageBlock'} style={style}>
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
            <path d={'M12 10v5'} stroke={'currentColor'} strokeWidth={'1.5'} strokeLinecap={'round'} />
            <circle cx={'12'} cy={'17.5'} r={'1'} fill={'currentColor'} />
          </svg>
        )}
        {text || 'Error loading data'}
      </div>
    </div>
  )
}

export { ErrorMessageBlock }
