import GroupsListItem from './GroupsListItem'
import type { GroupMember } from './GroupsListItem'
import { EmptyListMessage } from '../../ui/lists'
import { ErrorMessageBlock } from '../../Errors'
import { LoadingList } from '../../loading'
import { SmoothSize } from '../../ui/containers'
import { Button, Grid, GridItem } from '@chakra-ui/react'
import { ChevronIcon } from '../../ui/icons'
import type { DataContractGroup } from '../../../types'

import './GroupsList.scss'

const convertMembersToArray = (members: unknown): GroupMember[] => {
  if (!members || typeof members !== 'object') {
    return []
  }

  return Object.entries(members as Record<string, number | string>).map(([identifier, power]) => ({
    identifier,
    power
  }))
}

interface GroupEntry extends Partial<DataContractGroup> {
  id: string
  members?: unknown
  requiredPower?: number
}

interface GroupsListProps {
  groups?: Record<string, Partial<DataContractGroup>> | DataContractGroup[] | Record<string, unknown>
  headerStyles?: string
  loading?: boolean
  itemsCount?: number
  expandedGroup?: string | null
  onGroupToggle?: (groupId: string) => void
}

function GroupsList ({
  groups = {},
  headerStyles = 'light',
  loading,
  itemsCount = 10,
  expandedGroup,
  onGroupToggle
}: GroupsListProps) {
  const headerExtraClass: Record<string, string> = {
    default: '',
    light: 'GroupsList__ColumnTitles--Light'
  }

  const groupsArray: GroupEntry[] = Object.entries(groups as Record<string, Partial<DataContractGroup>>).map(([id, group]) => ({
    id,
    ...group
  }))

  const toggleGroup = (groupId: string) => {
    if (typeof onGroupToggle === 'function') {
      onGroupToggle(groupId)
    }
  }

  return (
    <div className={'GroupsList'}>
      {!loading
        ? <div className={'GroupsList__Items'}>
            {groupsArray?.map((group) => {
              const membersArray = convertMembersToArray(group?.members)
              const isExpanded = expandedGroup === group?.id

              return (
                <div key={group.id} className={`GroupsList__Group ${isExpanded ? 'GroupsList__Group--Expanded' : ''}`}>
                  <Grid className={'GroupsList__GroupHeader'}>
                    <GridItem className={'GroupsList__GroupHeaderColumn'}>
                      <span className={'GroupsList__GroupTitle'}>
                        Group #{group.id}
                      </span>
                      <span className={'GroupsList__RequiredPower'}>
                        Required Power: {group.requiredPower}
                      </span>
                    </GridItem>
                    <GridItem className={'GroupsList__GroupHeaderColumn GroupsList__GroupHeaderColumn--Button'}>
                      <Button
                        size={'sm'}
                        variant={isExpanded && membersArray.length > 0 ? 'gray' : 'blue'}
                        onClick={() => toggleGroup(group.id)}
                        className={'GroupsList__ToggleButton'}
                      >
                        {membersArray.length} members
                          <ChevronIcon
                            ml={'0.25rem'}
                            h={'0.625rem'}
                            w={'0.625rem'}
                            transform={`rotate(${isExpanded ? '-90deg' : '90deg'})`}
                          />
                      </Button>
                    </GridItem>
                  </Grid>

                  <SmoothSize className={'GroupsList__MembersContainer'}>
                    {isExpanded && membersArray.length > 0 && (
                      <div className={'GroupsList__MembersList'}>
                        <Grid className={`GroupsList__ColumnTitles ${headerExtraClass?.[headerStyles] || ''}`}>
                          <GridItem className={'GroupsList__ColumnTitle GroupsList__ColumnTitle--Identifier'}>
                            Identifier
                          </GridItem>
                          <GridItem className={'GroupsList__ColumnTitle GroupsList__ColumnTitle--Power'}>
                            Power
                          </GridItem>
                        </Grid>

                        {membersArray.map((member) => (
                          <GroupsListItem
                            key={member.identifier}
                            member={member}
                          />
                        ))}
                      </div>
                    )}
                  </SmoothSize>
                </div>
              )
            })}
            {groupsArray?.length === 0 &&
              <EmptyListMessage>No groups created yet</EmptyListMessage>
            }
            {groupsArray === undefined && <ErrorMessageBlock/>}
          </div>
        : <LoadingList itemsCount={itemsCount}/>
      }
    </div>
  )
}

export default GroupsList
