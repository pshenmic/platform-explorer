import { Grid, GridItem } from '@chakra-ui/react'

import './Template.scss'

export const ContendersTemplate = ({ children, isVoteVisible, className = '' }) => (
    <div className={`ContendersList ${className}`}>
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
          {
            isVoteVisible &&
            <GridItem className={'ContendersList__ColumnTitle ContendersList__ColumnTitle--Actions'}>
              Actions
            </GridItem>
          }
        </Grid>
         <div className={'VotesList__Items'}>
            { children }
         </div>
      </div>
    </div>
)
