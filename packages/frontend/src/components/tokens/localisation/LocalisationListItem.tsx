import type { ComponentType, ReactNode } from 'react'
import { Badge, Grid, GridItem } from '@chakra-ui/react'
// Untyped JS components — loose wrappers until data/* is migrated
import { NotActive as NotActiveJs } from '../../data'
import type { Localization } from '../../../types'
import type { WithClassName } from '../../../types/common'
import './LocalisationListItem.scss'

const NotActive = NotActiveJs as ComponentType<{ children?: ReactNode, className?: string }>

interface LocalisationListItemProps extends WithClassName {
  langCode?: string
  localisation?: Partial<Localization> | null
}

function LocalisationListItem ({ langCode, localisation, className }: LocalisationListItemProps) {
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
