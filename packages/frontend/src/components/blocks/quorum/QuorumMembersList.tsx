'use client'

import QuorumMembersListItem from './QuorumMembersListItem'
import type { QuorumMember } from './QuorumMembersListItem'
import { EmptyListMessage } from '../../ui/lists'
import { ErrorMessageBlock } from '../../Errors'
import { LoadingList } from '../../loading'
import './QuorumMembersList.css'

const headerExtraClass: Record<string, string> = {
  default: '',
  light: 'QuorumMembersList__ColumnTitles--Light'
}

interface QuorumMembersListProps {
  members?: QuorumMember[]
  loading?: boolean
  itemsCount?: number
  headerStyles?: string
}

function QuorumMembersList({
  members = [],
  loading,
  itemsCount = 10,
  headerStyles = 'default'
}: QuorumMembersListProps) {
  return (
    <div className={'QuorumMembersList'}>
      <div className={`QuorumMembersList__ColumnTitles ${headerExtraClass[headerStyles] || ''}`}>
        <div
          className={'QuorumMembersList__ColumnTitle QuorumMembersList__ColumnTitle--ProtxHash'}
        >
          Protx hash
        </div>
        <div
          className={'QuorumMembersList__ColumnTitle QuorumMembersList__ColumnTitle--Service'}
        >
          Service
        </div>
        <div
          className={
            'QuorumMembersList__ColumnTitle QuorumMembersList__ColumnTitle--OperatorPubKey'
          }
        >
          Operator Pubkey
        </div>
        <div
          className={'QuorumMembersList__ColumnTitle QuorumMembersList__ColumnTitle--Valid'}
        >
          Valid
        </div>
      </div>

      {!loading ? (
        <div className={'QuorumMembersList__Items'}>
          {members.map((member, i) => (
            <QuorumMembersListItem member={member} key={i} />
          ))}
          {members?.length === 0 && (
            <EmptyListMessage>There are no quorum members yet.</EmptyListMessage>
          )}
          {!members && <ErrorMessageBlock />}
        </div>
      ) : (
        <LoadingList itemsCount={itemsCount} />
      )}
    </div>
  )
}

export default QuorumMembersList
