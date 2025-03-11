import { Identifier, TimeDelta } from '../../data'
import { BaseSearchItem, BaseSearchItemContent } from './BaseSearchItem'

export function DocumentSearchItem ({ document, className }) {
  return (
    <BaseSearchItem
      href={`/document/${document?.identifier}`}
      className={`SearchResultsListItem--Document ${className || ''}`}
    >
      <BaseSearchItemContent
        mainContent={
          <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>{document?.identifier}</Identifier>
        }
        additionalContent={
          <Identifier avatar={!!document?.owner?.identifier} ellipsis={true}>{document?.owner?.identifier || '-'}</Identifier>
        }
        timestamp={<TimeDelta endDate={document?.timestamp || new Date()}/>}
      />
    </BaseSearchItem>
  )
}
