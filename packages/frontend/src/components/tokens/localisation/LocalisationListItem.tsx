import type { ComponentType, ReactNode } from 'react'
import { Badge } from '../../ui/Badge'
// Untyped JS components — loose wrappers until data/* is migrated
import { NotActive as NotActiveJs } from '../../data'
import type { Localization } from '../../../types'
import type { WithClassName } from '../../../types/common'
import './LocalisationListItem.css'

const NotActive = NotActiveJs as ComponentType<{ children?: ReactNode; className?: string }>

interface LocalisationListItemProps extends WithClassName {
  langCode?: string
  localisation?: Partial<Localization> | null
}

function LocalisationListItem({ langCode, localisation, className }: LocalisationListItemProps) {
  return (
    <div className={`LocalisationListItem ${className || ''}`}>
      <div className={'LocalisationListItem__Content'}>
        <div className={'LocalisationListItem__Column LocalisationListItem__Column--Language'}>
          {langCode !== undefined ? langCode : <NotActive>-</NotActive>}
        </div>
        <div className={'LocalisationListItem__Column LocalisationListItem__Column--Singular'}>
          {localisation?.singularForm !== undefined ? localisation?.singularForm : <NotActive />}
        </div>
        <div className={'LocalisationListItem__Column LocalisationListItem__Column--Plural'}>
          {localisation?.pluralForm !== undefined ? localisation?.pluralForm : <NotActive />}
        </div>
        <div
          className={'LocalisationListItem__Column LocalisationListItem__Column--Capitalize'}
        >
          {localisation?.shouldCapitalize !== undefined ? (
            <Badge colorScheme={localisation?.shouldCapitalize ? 'orange' : 'gray'}>
              {localisation?.shouldCapitalize ? 'true' : 'false'}
            </Badge>
          ) : (
            <NotActive />
          )}
        </div>
      </div>
    </div>
  )
}

export default LocalisationListItem
