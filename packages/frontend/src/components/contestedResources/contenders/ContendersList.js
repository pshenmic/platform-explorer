import { Grid, GridItem } from '@chakra-ui/react'
import { EmptyListMessage } from '../../ui/lists'
import ContendersListItem from './ContendersListItem'
import { ErrorMessageBlock } from '../../Errors'
import { LoadingList } from '../../loading'
import './ContendersList.scss'

function ContendersList ({ contenders = [], className, loading, itemsCount = 10 }) {
  return (
    <div className={`ContendersList ${className || ''}`}>
      <div className={'ContendersList__ScrollZone'}>
        <Grid className={'ContendersList__ColumnTitles'}>
          <GridItem className={'ContendersList__ColumnTitle ContendersList__ColumnTitle--Timestamp'}>
            Date
          </GridItem>
          <GridItem className={'ContendersList__ColumnTitle ContendersList__ColumnTitle--Hash'}>
            Tx Hash
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
          <GridItem className={'ContendersList__ColumnTitle ContendersList__ColumnTitle--Actions'}>
            Actions
          </GridItem>
        </Grid>

        {!loading
          ? <div className={'VotesList__Items'}>
            {contenders.map((contender, i) =>
              <ContendersListItem contender={contender} key={i}/>
            )}
            {contenders?.length === 0 &&
              <EmptyListMessage>There are no contenders</EmptyListMessage>
            }
            {!contenders && <ErrorMessageBlock/>}
          </div>
          : <LoadingList itemsCount={itemsCount}/>
        }
      </div>
    </div>
  )
}

export default ContendersList
