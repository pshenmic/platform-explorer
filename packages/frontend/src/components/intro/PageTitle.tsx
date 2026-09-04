'use client'

import type { ReactNode } from 'react'
import { InfoIcon } from '../ui/icons'
import { Tooltip } from '../ui/Tooltips'
import type { WithClassName } from '../../types/common'
import './PageTitle.css'

interface PageTitleProps extends WithClassName {
  title?: ReactNode
  description?: ReactNode
}

function PageTitle({ title, description, className }: PageTitleProps) {
  return (
    <div className={`PageTitle ${className || ''}`}>
      <h1 className={'PageTitle__Title'}>{title}</h1>

      {description && (
        <Tooltip content={description} placement={'bottom'}>
          <button type={'button'} className={'PageTitle__InfoButton'} aria-label={'About'}>
            <InfoIcon />
          </button>
        </Tooltip>
      )}
    </div>
  )
}

export default PageTitle
