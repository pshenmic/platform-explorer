import { Badge, Grid, GridItem } from '@chakra-ui/react'
import { Identifier, IpAddress } from '../../data'
import Link from 'next/link'
import './QuorumMembersListItem.scss'

function QuorumMembersListItem ({ member }) {
  return (
    <Link href={`/validator/${member?.proTxHash}`} className={'QuorumListItem'}>
      <Grid className={'QuorumListItem__Content'}>
        <GridItem className={'QuorumListItem__Column QuorumListItem__Column--ProtxHash'}>
          <Identifier
            styles={['highlight-both']}
            ellipsis={true}
            avatar={true}
          >
            {member?.proTxHash}
          </Identifier>
        </GridItem>
        <GridItem className={'QuorumListItem__Column QuorumListItem__Column--Service'}>
          <IpAddress variant={'dim'} clickable={false}>{member?.service}</IpAddress>
        </GridItem>
        <GridItem className={'QuorumListItem__Column QuorumListItem__Column--OperatorPubKey'}>
          <Identifier
            styles={['highlight-both']}
            ellipsis={false}
            copyButton={true}
          >
            {member?.pubKeyOperator}
          </Identifier>
        </GridItem>
        <GridItem className={'QuorumListItem__Column QuorumListItem__Column--Valid'}>
          {typeof member?.valid === 'boolean' &&
            <Badge colorScheme={member?.valid ? 'green' : 'red'}>
              {member?.valid ? 'Valid' : 'No'}
            </Badge>
          }
        </GridItem>
      </Grid>
    </Link>
  )
}

export default QuorumMembersListItem
