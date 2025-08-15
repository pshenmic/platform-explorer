import Link from 'next/link'
import { Identifier, BigNumber } from '../../data'
import ValueContainer from '../../ui/containers/ValueContainer'
import { Grid, GridItem } from '@chakra-ui/react'
import './GroupsListItem.scss'

function GroupsListItem ({ member }) {
  return (
    <Link href={`/identity/${member.identifier}`} className={'GroupsListItem'}>
      <Grid className={'GroupsListItem__Content'}>
        <GridItem className={'GroupsListItem__Column GroupsListItem__Column--Identifier'}>
          <Identifier
            avatar={true}
            ellipsis={true}
            styles={['highlight-both']}
            className={'GroupsListItem__Identifier'}
          >
            {member.identifier}
          </Identifier>
        </GridItem>

        <GridItem className={'GroupsListItem__Column GroupsListItem__Column--Power'}>
          <ValueContainer colorScheme={'darkGray'} size={'xs'}>
            <BigNumber>{member.power}</BigNumber>
          </ValueContainer>
        </GridItem>
      </Grid>
    </Link>
  )
}

export default GroupsListItem
