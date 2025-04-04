import { Badge } from '@chakra-ui/react'
import { Alias, Identifier, TimeDelta, NotActive } from '../../data'
import { BaseSearchItem, BaseSearchItemContent } from './BaseSearchItem'

const STATUS_COLORS = {
  ok: 'green',
  pending: 'orange',
  locked: 'red'
}

export function IdentitySearchItem ({ identity, className, onClick }) {
  return (
    <BaseSearchItem
      href={`/identity/${identity?.identifier}`}
      className={`${className || ''}`}
      gridClassModifier={'Identity'}
      onClick={onClick}
      data={identity}
    >
      <BaseSearchItemContent
        mainContent={
          identity?.alias
            ? <Alias avatarSource={identity?.identifier} ellipsis={true}>{identity?.alias}</Alias>
            : <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>{identity?.identifier}</Identifier>
        }
        additionalContent={
          identity?.status?.status
            ? <Badge size={'xs'} colorScheme={STATUS_COLORS[identity?.status?.status] || 'gray'}>
                {identity?.status?.status}
              </Badge>
            : <NotActive>-</NotActive>
        }
        timestamp={<TimeDelta endDate={identity?.status?.timestamp ? new Date(identity?.status?.timestamp) : new Date(identity?.timestamp)}/>}
      />
    </BaseSearchItem>
  )
}
