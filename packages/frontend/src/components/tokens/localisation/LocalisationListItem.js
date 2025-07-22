import { Badge, Grid, GridItem } from '@chakra-ui/react'
import { NotActive } from '../../data'
import './LocalisationListItem.scss'

function LocalisationListItem ({ langCode, localisation, className }) {
  return (
    <div className={`LocalisationListItem ${className || ''}`}>
      <Grid className={'LocalisationListItem__Content'}>
        <GridItem className={'LocalisationListItem__Column LocalisationListItem__Column--Language'}>
          {langCode !== undefined
            ? langCode
            : <NotActive>-</NotActive>
          }
        </GridItem>
        <GridItem className={'LocalisationListItem__Column LocalisationListItem__Column--Singular'}>
          {localisation?.singularForm !== undefined
            ? localisation?.singularForm
            : <NotActive/>
          }
        </GridItem>
        <GridItem className={'LocalisationListItem__Column LocalisationListItem__Column--Plural'}>
          {localisation?.pluralForm !== undefined
            ? localisation?.pluralForm
            : <NotActive/>
          }
        </GridItem>
        <GridItem className={'LocalisationListItem__Column LocalisationListItem__Column--Capitalize'}>
          {localisation?.shouldCapitalize !== undefined
            ? <Badge colorScheme={localisation?.shouldCapitalize ? 'orange' : 'gray'}>
                {localisation?.shouldCapitalize ? 'true' : 'false'}
              </Badge>
            : <NotActive/>
          }
        </GridItem>
      </Grid>
    </div>
  )
}

export default LocalisationListItem
