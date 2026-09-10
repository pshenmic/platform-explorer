import { Grid, GridItem } from '@chakra-ui/react'
import LocalisationListItem from './LocalisationListItem'
import { EmptyListMessage } from '../../ui/lists'
import type { Localization } from '../../../types'
import type { WithClassName } from '../../../types/common'
import './LocalisationList.css'
import './LocalisationListItem.css'

interface LocalisationListProps extends WithClassName {
  localisations?: Record<string, Partial<Localization>> | null
}

function LocalisationList({ localisations = {}, className }: LocalisationListProps) {
  const localisationEntries = Object.entries(localisations || {})

  return (
    <div className={`LocalisationList ${className || ''}`}>
      <div className={'LocalisationList__ScrollZone'}>
        <Grid className={'LocalisationList__ColumnTitles'}>
          <GridItem
            className={'LocalisationList__ColumnTitle LocalisationList__ColumnTitle--Language'}
          >
            Language
          </GridItem>
          <GridItem
            className={'LocalisationList__ColumnTitle LocalisationList__ColumnTitle--Singular'}
          >
            Singular
          </GridItem>
          <GridItem
            className={'LocalisationList__ColumnTitle LocalisationList__ColumnTitle--Plural'}
          >
            Plural
          </GridItem>
          <GridItem
            className={'LocalisationList__ColumnTitle LocalisationList__ColumnTitle--Capitalize'}
          >
            Capitalize
          </GridItem>
        </Grid>

        {localisationEntries?.length > 0 &&
          localisationEntries.map(([langCode, localisationData]) => (
            <LocalisationListItem
              key={langCode}
              langCode={langCode}
              localisation={localisationData}
            />
          ))}

        {localisationEntries?.length === 0 && (
          <EmptyListMessage>There are no localisations</EmptyListMessage>
        )}
      </div>
    </div>
  )
}

export default LocalisationList
