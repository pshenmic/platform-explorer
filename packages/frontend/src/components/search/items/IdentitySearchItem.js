import { Badge } from '@chakra-ui/react'
import { Alias, Identifier, TimeDelta } from '../../data'
import { BaseSearchItem, BaseSearchItemContent } from './BaseSearchItem'

const STATUS_COLORS = {
  ok: 'green',
  pending: 'orange',
  locked: 'red'
}

export function IdentitySearchItem ({ identity, className }) {
  return (
    <BaseSearchItem
      href={`/identity/${identity?.identifier}`}
      className={className}
    >
      <BaseSearchItemContent
        mainContent={
          identity?.alias
            ? <Alias avatarSource={identity?.identifier} ellipsis={true}>{identity?.alias}</Alias>
            : <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>{identity?.identifier}</Identifier>
        }
        additionalContent={
          <Badge size={'xs'} colorScheme={STATUS_COLORS[identity?.status?.status] || 'gray'}>
            {identity?.status?.status}
          </Badge>
        }
        timestamp={<TimeDelta endDate={new Date(identity.timestamp)}/>}
      />
    </BaseSearchItem>
  )
}
