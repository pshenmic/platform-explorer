'use client'

export interface QuorumMember {
  proTxHash?: string | null
  service?: string | null
  pubKeyOperator?: string | null
  valid?: boolean | null
}
import { DataList } from '../../ui/lists'
import type { DataListProps } from '../../ui/lists/DataList/DataList'
import { Identifier, IpAddress, NotActive } from '../../data'
import { Badge } from '../../ui/Badge'

interface QuorumMembersListProps {
  paging?: DataListProps['paging']
  members?: QuorumMember[]
  loading?: boolean
  itemsCount?: number
  headerStyles?: string
}

export default function QuorumMembersList({
  members = [],
  paging,
  loading,
  itemsCount = 10,
  headerStyles = 'default'
}: QuorumMembersListProps) {
  return (
    <DataList
      items={members}
      paging={paging}
      loading={loading}
      skeletonCount={itemsCount}
      pinFirst
      headerVariant={headerStyles === 'light' ? 'light' : 'default'}
      rowKey={(member, index) => member.proTxHash ?? String(index)}
      rowHref={member => (member.proTxHash ? `/validator/${member.proTxHash}` : undefined)}
      emptyMessage="There are no quorum members yet."
      columns={[
        {
          key: 'proTxHash',
          header: 'Protx hash',
          minWidth: 180,
          grow: true,
          cell: member =>
            member.proTxHash ? (
              <Identifier ellipsis avatar copyButton>
                {member.proTxHash}
              </Identifier>
            ) : (
              <NotActive />
            )
        },
        {
          key: 'service',
          header: 'Service',
          minWidth: 160,
          cell: member =>
            member.service ? (
              <IpAddress variant="dim" clickable={false}>
                {member.service}
              </IpAddress>
            ) : (
              <NotActive />
            )
        },
        {
          key: 'pubKeyOperator',
          header: 'Operator Pubkey',
          minWidth: 200,
          grow: true,
          cell: member =>
            member.pubKeyOperator ? (
              <Identifier ellipsis copyButton>
                {member.pubKeyOperator}
              </Identifier>
            ) : (
              <NotActive />
            )
        },
        {
          key: 'valid',
          header: 'Valid',
          minWidth: 80,
          align: 'center',
          cell: member =>
            typeof member.valid === 'boolean' ? (
              <Badge colorScheme={member.valid ? 'green' : 'red'}>
                {member.valid ? 'Valid' : 'No'}
              </Badge>
            ) : (
              <NotActive />
            )
        }
      ]}
    />
  )
}
