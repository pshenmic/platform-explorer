import { Alias, Identifier, TimeDelta } from '../../data'
import { BaseSearchItem, BaseSearchItemContent } from './BaseSearchItem'

export function DataContractSearchItem ({ dataContract, className, onClick }) {
  return (
    <BaseSearchItem
      href={`/dataContract/${dataContract?.identifier}`}
      className={`${className || ''}`}
      gridClassModifier={'DataContract'}
      onClick={onClick}
      data={dataContract}
    >
      <BaseSearchItemContent
        mainContent={
          dataContract?.name
            ? <Alias avatarSource={dataContract?.identifier} ellipsis={true}>{dataContract?.name}</Alias>
            : <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>{dataContract?.identifier}</Identifier>
        }
        additionalContent={
          <Identifier avatar={!!dataContract?.owner?.identifier} ellipsis={true}>{dataContract?.owner?.identifier || '-'}</Identifier>
        }
        timestamp={<TimeDelta endDate={dataContract?.timestamp}/>}
      />
    </BaseSearchItem>
  )
}
