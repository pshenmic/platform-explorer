import { Grid, GridItem } from '@chakra-ui/react'
import { Identifier, IpAddress } from '../../data'
import './QuorumMembersListItem.scss'

function QuorumMembersListItem ({ member }) {
  return (
    <div className={'QuorumListItem'}>
      <Grid className={'QuorumListItem__Content'}>
        <GridItem className={'QuorumListItem__Column QuorumListItem__Column--ProtxHash'}>
          <Identifier
            styles={['highlight-both']}
            copyButton={true}
            ellipsis={false}
          >
            {member?.proTxHash}
          </Identifier>
        </GridItem>
        <GridItem className={'QuorumListItem__Column QuorumListItem__Column--Service'}>
          <IpAddress>{member?.service}</IpAddress>
        </GridItem>
        <GridItem className={'QuorumListItem__Column QuorumListItem__Column--OperatorPubKey'}>
          <Identifier
            styles={['highlight-both']}
            copyButton={true}
            ellipsis={false}
          >
            {member?.pubKeyOperator}
          </Identifier>
        </GridItem>
        <GridItem className={'QuorumListItem__Column QuorumListItem__Column--Valid'}>
          {member?.valid ? 'Yes' : 'No'}
        </GridItem>
      </Grid>
    </div>
  )
}

export default QuorumMembersListItem
