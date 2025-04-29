import { Identifier, TimeDelta } from '../../data'
import { BaseSearchItem, BaseSearchItemContent } from './BaseSearchItem'

export function DocumentSearchItem ({ document, className, onClick }) {
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
          <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>{document?.identifier}</Identifier>
        }
        additionalContent={
          <Identifier avatar={!!document?.owner?.identifier} ellipsis={true}>{document?.owner?.identifier || '-'}</Identifier>
        }
        timestamp={<TimeDelta endDate={document?.timestamp}/>}
      />
    </BaseSearchItem>
  )
}
