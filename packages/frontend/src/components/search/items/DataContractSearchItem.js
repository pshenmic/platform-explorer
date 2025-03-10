import { Alias, Identifier, TimeDelta } from '../../data'
import { BaseSearchItem, BaseSearchItemContent } from './BaseSearchItem'

export function DataContractSearchItem ({ dataContract, className }) {
  return (
    <BaseSearchItem
      href={`/dataContract/${dataContract?.identifier}`}
      className={className}
    >
      <BaseSearchItemContent
        mainContent={
          dataContract?.name
            ? <Alias avatarSource={dataContract?.identifier} ellipsis={true}>{dataContract?.name}</Alias>
            : <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>{dataContract?.identifier}</Identifier>
        }
        additionalContent={
          <Identifier avatar={true} ellipsis={true}>{dataContract?.ownerId || 'Unknown'}</Identifier>
        }
        timestamp={<TimeDelta endDate={dataContract?.timestamp || new Date()}/>}
      />
    </BaseSearchItem>
  )
}
