import QuorumMembersListItem from './QuorumMembersListItem'
import { EmptyListMessage } from '../../ui/lists'
import { Grid, GridItem } from '@chakra-ui/react'
import './QuorumMembersList.scss'

function QuorumMembersList ({ members = [], headerStyles = 'default' }) {
  const headerExtraClass = {
    default: '',
    light: 'QuorumMembersList__ColumnTitles--Light'
  }

  console.log('members', members)

  return (
    <div className={'QuorumMembersList'}>
      <Grid className={`QuorumMembersList__ColumnTitles ${headerExtraClass[headerStyles] || ''}`}>
        <GridItem className={'QuorumMembersList__ColumnTitle QuorumMembersList__ColumnTitle--ProtxHash'}>
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
        <QuorumMembersListItem member={member} key={i}/>
      )}

      {members.length === 0 &&
        <EmptyListMessage>There are no quorum members yet.</EmptyListMessage>
      }
    </div>
  )
}

export default QuorumMembersList
