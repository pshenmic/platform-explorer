'use client'
import { DataList } from '../../ui/lists'
import { NotActive } from '../../data'
import { Badge } from '../../ui/Badge'
import type { Localization } from '../../../types'
import type { WithClassName } from '../../../types/common'
interface LocalisationListProps extends WithClassName {
  localisations?: Record<string, Partial<Localization>> | null
}

export default function LocalisationList({ localisations = {}, className }: LocalisationListProps) {
  const items = Object.entries(localisations || {}).map(([language, value]) => ({
    language,
    ...value
  }))
  return (
    <DataList
      items={items}
      className={className}
      rowKey={item => item.language}
      emptyMessage="There are no localisations"
      columns={[
        { key: 'language', header: 'Language', minWidth: 100, cell: item => item.language },
        {
          key: 'singular',
          header: 'Singular',
          minWidth: 140,
          grow: true,
          cell: item => item.singularForm ?? <NotActive />
        },
        {
          key: 'plural',
          header: 'Plural',
          minWidth: 140,
          grow: true,
          cell: item => item.pluralForm ?? <NotActive />
        },
        {
          key: 'capitalize',
          header: 'Capitalize',
          minWidth: 100,
          cell: item =>
            item.shouldCapitalize !== undefined ? (
              <Badge colorScheme={item.shouldCapitalize ? 'orange' : 'gray'}>
                {String(item.shouldCapitalize)}
              </Badge>
            ) : (
              <NotActive />
            )
        }
      ]}
    />
  )
}
