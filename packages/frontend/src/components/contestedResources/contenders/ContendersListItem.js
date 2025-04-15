import { Grid, GridItem } from '@chakra-ui/react'
import './ContendersList.scss'

function ContendersListItem ({ contender, className }) {
  console.log('contender', contender)

  return (
    <div className={`PublicKeysListItem ${className || ''}`}>
      <Grid className={'PublicKeysListItem__Content'}>
        <GridItem className={'PublicKeysListItem__Column--Date'}>
          1 Date
        </GridItem>
        <GridItem className={'PublicKeysListItem__Column PublicKeysListItem__Column--Hash'}>
          2 Hash
        </GridItem>
        <GridItem className={'PublicKeysListItem__Column PublicKeysListItem__Column--Identity'}>
          3 Identity
        </GridItem>
        <GridItem className={'PublicKeysListItem__Column PublicKeysListItem__Column--Document'}>
          4 Document
        </GridItem>
        <GridItem className={'PublicKeysListItem__Column PublicKeysListItem__Column--Votes'}>
          5 Votes
        </GridItem>
      </Grid>
    </div>
  )
}

export default ContendersListItem
