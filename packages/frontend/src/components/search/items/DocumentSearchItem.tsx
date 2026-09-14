import type { ComponentType, ReactNode } from 'react'
import type { Document } from '../../../types'
import type { WithClassName } from '../../../types/common'
// Untyped JS components — loose wrappers until data/* is migrated
import { Identifier as IdentifierJs, TimeDelta as TimeDeltaJs } from '../../data'
import { BaseSearchItem, BaseSearchItemContent } from './BaseSearchItem'

const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  avatar?: boolean
  ellipsis?: boolean
  styles?: string[]
}>
const TimeDelta = TimeDeltaJs as ComponentType<{ endDate?: string | Date | null }>

interface DocumentSearchItemProps extends WithClassName {
  document?: Partial<Document> | null
  onClick?: (data: unknown) => void
}

export function DocumentSearchItem({ document, className, onClick }: DocumentSearchItemProps) {
  return (
    <BaseSearchItem
      href={`/document/${document?.identifier}`}
      className={`${className || ''}`}
      gridClassModifier={'Document'}
      onClick={onClick}
      data={document}
    >
      <BaseSearchItemContent
        mainContent={
          <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>
            {document?.identifier}
          </Identifier>
        }
        additionalContent={
          <Identifier avatar={!!document?.owner?.identifier} ellipsis={true}>
            {document?.owner?.identifier || '-'}
          </Identifier>
        }
        timestamp={<TimeDelta endDate={document?.timestamp} />}
      />
    </BaseSearchItem>
  )
}
