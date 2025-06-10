import {Badge, Grid, GridItem} from '@chakra-ui/react'
import { ValueCard } from '../../cards'
import { ValueContainer } from '../../ui/containers'
import { NotActive } from '../../data'
import './LocalisationListItem.scss'

function LocalisationListItem ({ localisation, className }) {
  return (
    <div className={`LocalisationListItem ${className || ''}`}>
      <Grid className={'LocalisationListItem__Content'}>
        <GridItem className={'LocalisationListItem__Column LocalisationListItem__Column--Language'}>
          {localisation?.language !== undefined
            ? localisation?.language
            : <NotActive>-</NotActive>
          }
        </GridItem>
        <GridItem className={'LocalisationListItem__Column LocalisationListItem__Column--Singular'}>
          {localisation?.singular !== undefined
            ? localisation?.singular
            : <NotActive/>
          }
        </GridItem>
        <GridItem className={'LocalisationListItem__Column LocalisationListItem__Column--Plural'}>
          {localisation?.plural !== undefined
            ? localisation?.plural
            : <NotActive/>
          }
        </GridItem>
        <GridItem className={'LocalisationListItem__Column LocalisationListItem__Column--Capitalize'}>
          {localisation?.capitalize !== undefined
            ? <Badge colorScheme={localisation?.capitalize ? 'orange' : 'gray'}>
                {localisation?.capitalize ? 'true' : 'false'}
              </Badge>
            : <NotActive/>
          }
        </GridItem>
      </Grid>
    </div>
  )
}

export default LocalisationListItem
