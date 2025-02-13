import QuorumMembersListItem from './QuorumMembersListItem'
import { EmptyListMessage } from '../../ui/lists'
import { Grid, GridItem } from '@chakra-ui/react'
import './QuorumMembersList.scss'

function QuorumMembersList ({ members = [], columnsCount = 1, size = 'l', headerStyles = 'default' }) {
  const headerExtraClass = {
    default: '',
    light: 'QuorumMembersList__ColumnTitles--Light'
  }

  console.log('members', members)

  return (
    <div className={'QuorumMembersList'}>
      <Grid className={`QuorumMembersList__ColumnTitles ${headerExtraClass[headerStyles] || ''}`}>
        <GridItem className={'QuorumMembersList__ColumnTitle QuorumMembersList__ProtxHash'}>
          Protx hash
        </GridItem>
        <GridItem className={'QuorumMembersList__ColumnTitle QuorumMembersList__ColumnTitle--Service'}>
          Service
        </GridItem>
        <GridItem className={'QuorumMembersList__ColumnTitle QuorumMembersList__ColumnTitle--OperatorPubKey'}>
          Operator  Pubkey
        </GridItem>
        <GridItem className={'QuorumMembersList__ColumnTitle QuorumMembersList__ColumnTitle--Valid'}>
          Valid
        </GridItem>
      </Grid>

      {members.map((member, i) =>
        <QuorumMembersListItem
          key={i}
          member={member}
          size={size}
        />
      )}

      {members.length === 0 &&
        <EmptyListMessage>There are no quorum members yet.</EmptyListMessage>
      }
    </div>
  )
}

export default QuorumMembersList
