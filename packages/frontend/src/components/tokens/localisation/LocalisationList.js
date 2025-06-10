import { Grid, GridItem } from '@chakra-ui/react'
import LocalisationListItem from './LocalisationListItem'
import { EmptyListMessage } from '../../ui/lists'
import './LocalisationList.scss'
import './LocalisationListItem.scss'

function LocalisationList ({ localisations = [], className }) {
  return (
    <div className={`LocalisationList ${className || ''}`}>
      <div className={'LocalisationList__ScrollZone'}>
        <Grid className={'LocalisationList__ColumnTitles'}>
          <GridItem className={'LocalisationList__ColumnTitle LocalisationList__ColumnTitle--Language'}>
            Language
          </GridItem>
          <GridItem className={'LocalisationList__ColumnTitle LocalisationList__ColumnTitle--Singular'}>
            Singular
          </GridItem>
          <GridItem className={'LocalisationList__ColumnTitle LocalisationList__ColumnTitle--Plural'}>
            Plural
          </GridItem>
          <GridItem className={'LocalisationList__ColumnTitle LocalisationList__ColumnTitle--Capitalize'}>
            Capitalize
          </GridItem>
        </Grid>

        {localisations?.length > 0 &&
          localisations.map((localisation, i) => <LocalisationListItem localisation={localisation} key={i}/>)
        }

        {localisations?.length === 0 &&
          <EmptyListMessage>There are no localisations</EmptyListMessage>
        }
      </div>
    </div>
  )
}

export default LocalisationList 