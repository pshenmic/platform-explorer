import type { WithClassName } from '../../../types/common'
import type { ComponentType } from 'react'
// Untyped JS component — loose wrapper until loading/* is migrated
import { LoadingLine as LoadingLineJs } from '../../loading'

const LoadingLine = LoadingLineJs as ComponentType<{ colorScheme?: string }>

export function LoadingSearchItem({ className }: WithClassName) {
  return (
    <div className={`SearchResultsListItem SearchResultsListItem--Loading ${className || ''}`}>
      <div className={'SearchResultsListItem__Content'}>
        <div>
          <LoadingLine colorScheme={'gray'} />
        </div>
        <div>
          <LoadingLine colorScheme={'gray'} />
        </div>
        <div>
          <LoadingLine colorScheme={'gray'} />
        </div>
        <div className={'SearchResultsListItem__ArrowButtonContainer'}>
          <span className={'SearchResultsListItem__ArrowButton'} />
        </div>
      </div>
    </div>
  )
}
