import SearchResultsListItem from './SearchResultsListItem'
import './SearchResultsList.scss'
import { Grid, GridItem } from '@chakra-ui/react'
import { categoryMap, entityTypes, singularCategoryNames, pluralCategoryNames, modifierMap } from './constants'

// Flatten each tx into its occurrences so duplicates render as their own rows
const expandOccurrences = (entity) => [
  entity,
  ...(entity?.duplicates ?? []).map((duplicate) => ({ ...duplicate, isDuplicate: true }))
]

const COLUMN_TITLES = {
  [categoryMap.validators]: ['Identity', 'Balance'],
  [categoryMap.identities]: ['Status', 'Time'],
  [categoryMap.dataContracts]: ['Owner', 'Time'],
  [categoryMap.blocks]: ['Height', 'Time'],
  [categoryMap.documents]: ['Identity', 'Time'],
  [categoryMap.transactions]: ['Status', 'Time'],
  [categoryMap.tokens]: ['Owner', 'Time'],
  [categoryMap.platformAddresses]: ['Txs']
}

function ListCategory ({ type, data, onItemClick }) {
  const titles = COLUMN_TITLES[categoryMap[type]]

  if (!titles) return null

  const displayData = categoryMap[type] === entityTypes.transaction
    ? data.flatMap(expandOccurrences)
    : data

  return (
    <div className={'SearchResultsList__Category'}>
      <Grid className={`SearchResultsList__ColumnTitles SearchResultsList__ColumnTitles--${modifierMap[categoryMap[type]] || ''}`}>
        <GridItem className={'SearchResultsList__ColumnTitle'}>
          {displayData?.length} {displayData?.length > 1 ? pluralCategoryNames[type] : singularCategoryNames[categoryMap[type]]} FOUND
        </GridItem>
        {titles.map((title, i) => (
          <GridItem key={i} className={'SearchResultsList__ColumnTitle'}>
            {title}
          </GridItem>
        ))}
        <GridItem/>
      </Grid>
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

function SearchResultsList ({ results, onItemClick }) {
  return (
    <div className={'SearchResultsList'}>
      {results.loading && (
        <SearchResultsListItem entityType={'loading'}/>
      )}

      {results.error && (
        <div className={'SearchResultsList__Title SearchResultsList__Title--NotFound'}>
          Nothing found
        </div>
      )}

      {results.data && Object.entries(results.data)?.length > 0 && (
        Object.entries(results.data).map(([category, items]) => (
          <ListCategory key={category} type={category} data={items} onItemClick={onItemClick}/>
        ))
      )}
    </div>
  )
}

export default SearchResultsList
