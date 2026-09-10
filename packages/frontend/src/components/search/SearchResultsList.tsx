import type { Transaction } from '../../types'
import type { LoadableState } from '../../types/common'
import SearchResultsListItem from './SearchResultsListItem'
import './SearchResultsList.css'
import {
  categoryMap,
  entityTypes,
  singularCategoryNames,
  pluralCategoryNames,
  modifierMap,
  type SearchCategory
} from './constants'

// Flatten each tx into its occurrences so duplicates render as their own rows
const expandOccurrences = (entity: Transaction & { isDuplicate?: boolean }) => [
  entity,
  ...(entity?.duplicates ?? []).map(duplicate => ({ ...duplicate, isDuplicate: true as const }))
]

const COLUMN_TITLES: Partial<Record<string, string[]>> = {
  [categoryMap.validators]: ['Identity', 'Balance'],
  [categoryMap.identities]: ['Status', 'Time'],
  [categoryMap.dataContracts]: ['Owner', 'Time'],
  [categoryMap.blocks]: ['Height', 'Time'],
  [categoryMap.documents]: ['Identity', 'Time'],
  [categoryMap.transactions]: ['Status', 'Time'],
  [categoryMap.tokens]: ['Owner', 'Time'],
  [categoryMap.platformAddresses]: ['Txs']
}

export type SearchResultsData = Partial<Record<SearchCategory, unknown[]>>

interface ListCategoryProps {
  type: SearchCategory
  data: unknown[]
  onItemClick?: (data: unknown) => void
}

function ListCategory({ type, data, onItemClick }: ListCategoryProps) {
  const titles = COLUMN_TITLES[categoryMap[type]]

  if (!titles) return null

  const displayData =
    categoryMap[type] === entityTypes.transaction
      ? (data as Array<Transaction & { isDuplicate?: boolean }>).flatMap(expandOccurrences)
      : data

  return (
    <div className={'SearchResultsList__Category'}>
      <div
        className={`SearchResultsList__ColumnTitles SearchResultsList__ColumnTitles--${modifierMap[categoryMap[type]] || ''}`}
      >
        <div className={'SearchResultsList__ColumnTitle'}>
          {displayData?.length}{' '}
          {displayData?.length > 1
            ? pluralCategoryNames[type]
            : singularCategoryNames[categoryMap[type]]}{' '}
          FOUND
        </div>
        {titles.map((title, i) => (
          <div key={i} className={'SearchResultsList__ColumnTitle'}>
            {title}
          </div>
        ))}
        <div />
      </div>
      <div>
        {displayData?.map((entity, i) => (
          <SearchResultsListItem
            entity={entity}
            entityType={categoryMap[type]}
            onClick={onItemClick}
            key={i}
          />
        ))}
      </div>
    </div>
  )
}

interface SearchResultsListProps {
  results: LoadableState<SearchResultsData>
  onItemClick?: (data: unknown) => void
}

function SearchResultsList({ results, onItemClick }: SearchResultsListProps) {
  return (
    <div className={'SearchResultsList'}>
      {results.loading && <SearchResultsListItem entityType={'loading'} />}

      {results.error && (
        <div className={'SearchResultsList__Title SearchResultsList__Title--NotFound'}>
          Nothing found
        </div>
      )}

      {results.data &&
        Object.entries(results.data)?.length > 0 &&
        Object.entries(results.data).map(([category, items]) => (
          <ListCategory
            key={category}
            type={category as SearchCategory}
            data={(items as unknown[]) ?? []}
            onItemClick={onItemClick}
          />
        ))}
    </div>
  )
}

export default SearchResultsList
