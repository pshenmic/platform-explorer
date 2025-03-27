import { Identifier, TimeDelta } from '../../data'
import { BaseSearchItem, BaseSearchItemContent } from './BaseSearchItem'

export function DocumentSearchItem ({ document, className, onClick }) {
  return (
    <BaseSearchItem
      href={`/document/${document?.identifier}`}
      className={`${className || ''}`}
      gridClassModifier={'Document'}
      onClick={typeof onClick === 'function' ? () => onClick(document) : null}
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
