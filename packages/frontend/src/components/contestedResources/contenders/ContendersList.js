import { Grid, GridItem } from '@chakra-ui/react'
import { EmptyListMessage } from '../../ui/lists'
import ContendersListItem from './ContendersListItem'
import './ContendersList.scss'

function ContendersList ({ contenders = [], className }) {
  return (
    <div className={`ContendersList ${className || ''}`}>
      <div className={'ContendersList__ScrollZone'}>
        <Grid className={'ContendersList__ColumnTitles'}>
          <GridItem className={'ContendersList__ColumnTitle ContendersList__ColumnTitle--Date'}>
            Date
          </GridItem>
          <GridItem className={'ContendersList__ColumnTitle ContendersList__ColumnTitle--Hash'}>
            Hash
          </GridItem>
          <GridItem className={'ContendersList__ColumnTitle ContendersList__ColumnTitle--Identity'}>
            Identity
          </GridItem>
          <GridItem className={'ContendersList__ColumnTitle ContendersList__ColumnTitle--Document'}>
            Document
          </GridItem>
          <GridItem className={'ContendersList__ColumnTitle ContendersList__ColumnTitle--Votes'}>
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
