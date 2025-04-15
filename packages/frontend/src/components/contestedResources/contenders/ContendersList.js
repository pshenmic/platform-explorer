import { Grid, GridItem } from '@chakra-ui/react'
import { EmptyListMessage } from '../../ui/lists'
import ContendersListItem from './ContendersListItem'
import './ContendersList.scss'

function ContendersList ({ contenders = [], className }) {
  return (
    <div className={`ContendersListItem ${className || ''}`}>
      <div className={'ContendersListItem__ScrollZone'}>
        <Grid className={'ContendersListItem__ColumnTitles'}>
          <GridItem className={'ContendersListItem__ColumnTitle ContendersListItem__ColumnTitle--Date'}>
            Date
          </GridItem>
          <GridItem className={'ContendersListItem__ColumnTitle ContendersListItem__ColumnTitle--Hash'}>
            Hash
          </GridItem>
          <GridItem className={'ContendersListItem__ColumnTitle ContendersListItem__ColumnTitle--Identity'}>
            Identity
          </GridItem>
          <GridItem className={'ContendersListItem__ColumnTitle ContendersListItem__ColumnTitle--Document'}>
            Document
          </GridItem>
          <GridItem className={'ContendersListItem__ColumnTitle ContendersListItem__ColumnTitle--Votes'}>
            Votes
          </GridItem>
        </Grid>

        {contenders?.length > 0 &&
          contenders.map((contender, i) => <ContendersListItem contender={contender} key={i}/>)
        }

        {contenders?.length === 0 &&
          <EmptyListMessage>There are no public keys</EmptyListMessage>
        }
      </div>
    </div>
  )
}

export default ContendersList
