import { Grid, GridItem } from '@chakra-ui/react'
import './ContendersList.scss'

function ContendersListItem ({ contender, className }) {
  console.log('contender', contender)

  return (
    <div className={`ContendersListItem ${className || ''}`}>
      <Grid className={'ContendersListItem__Content'}>
        <GridItem className={'ContendersListItem__Column--Date'}>
          1 Date
        </GridItem>
        <GridItem className={'ContendersListItem__Column ContendersListItem__Column--Hash'}>
          2 Hash
        </GridItem>
        <GridItem className={'ContendersListItem__Column ContendersListItem__Column--Identity'}>
          3 Identity
        </GridItem>
        <GridItem className={'ContendersListItem__Column ContendersListItem__Column--Document'}>
          4 Document
        </GridItem>
        <GridItem className={'ContendersListItem__Column ContendersListItem__Column--Votes'}>
          5 Votes
        </GridItem>
      </Grid>
    </div>
  )
}

export default ContendersListItem
