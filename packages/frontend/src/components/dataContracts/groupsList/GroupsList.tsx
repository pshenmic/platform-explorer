import { Identifier, BigNumber } from '../../data'
import { DataList } from '../../ui/lists'

export interface GroupMember {
  identifier: string
  power: number | string
}
import { EmptyListMessage } from '../../ui/lists'
import { ErrorMessageBlock } from '../../Errors'
import { LoadingList } from '../../loading'
import { SmoothSize } from '../../ui/containers'
import { ChevronIcon } from '../../ui/icons'
import type { DataContractGroup } from '../../../types'

import './GroupsList.css'

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
  groups?:
    | Record<string, Partial<DataContractGroup>>
    | DataContractGroup[]
    | Record<string, unknown>
  headerStyles?: string
  loading?: boolean
  itemsCount?: number
  expandedGroup?: string | null
  onGroupToggle?: (groupId: string) => void
}

function GroupsList({
  groups = {},
  headerStyles = 'light',
  loading,
  itemsCount = 10,
  expandedGroup,
  onGroupToggle
}: GroupsListProps) {
  const groupsArray: GroupEntry[] = Object.entries(
    groups as Record<string, Partial<DataContractGroup>>
  ).map(([id, group]) => ({
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
      {!loading ? (
        <div className={'GroupsList__Items'}>
          {groupsArray?.map(group => {
            const membersArray = convertMembersToArray(group?.members)
            const isExpanded = expandedGroup === group?.id

            return (
              <div
                key={group.id}
                className={`GroupsList__Group ${isExpanded ? 'GroupsList__Group--Expanded' : ''}`}
              >
                <div className={'GroupsList__GroupHeader'}>
                  <div className={'GroupsList__GroupHeaderColumn'}>
                    <span className={'GroupsList__GroupTitle'}>Group #{group.id}</span>
                    <span className={'GroupsList__RequiredPower'}>
                      Required Power: {group.requiredPower}
                    </span>
                  </div>
                  <div
                    className={
                      'GroupsList__GroupHeaderColumn GroupsList__GroupHeaderColumn--Button'
                    }
                  >
                    <button
                      type={'button'}
                      onClick={() => toggleGroup(group.id)}
                      className={`GroupsList__ToggleButton GroupsList__ToggleButton--${
                        isExpanded && membersArray.length > 0 ? 'Gray' : 'Blue'
                      }`}
                    >
                      {membersArray.length} members
                      <ChevronIcon
                        style={{
                          marginLeft: '0.25rem',
                          height: '0.625rem',
                          width: '0.625rem',
                          transform: `rotate(${isExpanded ? '-90deg' : '90deg'})`
                        }}
                      />
                    </button>
                  </div>
                </div>

                <SmoothSize className={'GroupsList__MembersContainer'}>
                  {isExpanded && membersArray.length > 0 && (
                    <DataList
                      items={membersArray}
                      rowKey={member => member.identifier}
                      rowHref={member => `/identity/${member.identifier}`}
                      headerVariant={headerStyles === 'light' ? 'light' : 'default'}
                      columns={[
                        {
                          key: 'identifier',
                          header: 'Identifier',
                          minWidth: 180,
                          grow: true,
                          cell: member => (
                            <Identifier avatar ellipsis>
                              {member.identifier}
                            </Identifier>
                          )
                        },
                        {
                          key: 'power',
                          header: 'Power',
                          minWidth: 100,
                          numeric: true,
                          cell: member => <BigNumber>{member.power}</BigNumber>
                        }
                      ]}
                    />
                  )}
                </SmoothSize>
              </div>
            )
          })}
          {groupsArray?.length === 0 && <EmptyListMessage>No groups created yet</EmptyListMessage>}
          {groupsArray === undefined && <ErrorMessageBlock />}
        </div>
      ) : (
        <LoadingList itemsCount={itemsCount} />
      )}
    </div>
  )
}

export default GroupsList
