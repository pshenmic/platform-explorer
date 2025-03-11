import SearchResultsListItem from './SearchResultsListItem'
import './SearchResultsList.scss'
import { Grid, GridItem } from '@chakra-ui/react'
import { CATEGORY_MAP, SINGULAR_CATEGORY_NAMES, PLURAL_CATEGORY_NAMES, MODIFIER_MAP } from './constants'

const COLUMN_TITLES = {
  [CATEGORY_MAP.validators]: ['Identity', 'Balance'],
  [CATEGORY_MAP.identities]: ['Status', 'Time'],
  [CATEGORY_MAP.dataContracts]: ['Owner', 'Time'],
  [CATEGORY_MAP.blocks]: ['Epoch', 'Time'],
  [CATEGORY_MAP.documents]: ['Identity', 'Time'],
  [CATEGORY_MAP.transactions]: ['Status', 'Time']
}

function ListCategory ({ type, data }) {
  const titles = COLUMN_TITLES[CATEGORY_MAP[type]]

  if (!titles) return null

  return (
    <div className={'SearchResultsList__Category'}>
      <Grid className={`SearchResultsList__ColumnTitles SearchResultsList__ColumnTitles--${MODIFIER_MAP[CATEGORY_MAP[type]] || ''}`}>
        <GridItem className={'SearchResultsList__ColumnTitle'}>
          {data?.length} {data?.length > 1 ? PLURAL_CATEGORY_NAMES[type] : SINGULAR_CATEGORY_NAMES[CATEGORY_MAP[type]]} FOUND
        </GridItem>
        {titles.map((title, i) => (
          <GridItem key={i} className={'SearchResultsList__ColumnTitle'}>
            {title}
          </GridItem>
        ))}
        <GridItem/>
      </Grid>
      <div>
        {data?.map((entity, i) => (
          <SearchResultsListItem
            entity={entity}
            entityType={CATEGORY_MAP[type]}
            key={i}
          />
        ))}
      </div>
    </div>
  )
}

function SearchResultsList ({ results }) {
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
          <ListCategory key={category} type={category} data={items}/>
        ))
      )}
    </div>
  )
}

export default SearchResultsList
