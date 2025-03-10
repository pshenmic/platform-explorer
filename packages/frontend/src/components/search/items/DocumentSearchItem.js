import { Identifier, TimeDelta } from '../../data'
import { BaseSearchItem, BaseSearchItemContent } from './BaseSearchItem'

export function DocumentSearchItem ({ document, className }) {
  return (
    <BaseSearchItem
      href={`/document/${document?.identifier}`}
      className={className}
    >
      <BaseSearchItemContent
        mainContent={
          <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>{document?.identifier}</Identifier>
        }
        additionalContent={
          <Identifier avatar={true} ellipsis={true}>{document?.ownerId || 'Unknown'}</Identifier>
        }
        timestamp={<TimeDelta endDate={document?.timestamp || new Date()}/>}
      />
    </BaseSearchItem>
  )
}
