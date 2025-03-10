import SearchResultsListItem from './SearchResultsListItem'
import './SearchResultsList.scss'
import { Grid, GridItem } from '@chakra-ui/react'
import { CATEGORY_MAP } from './constants'

const COLUMN_TITLES = {
  [CATEGORY_MAP.validators]: ['Validator', 'Identity', 'Balance'],
  [CATEGORY_MAP.identities]: ['Identity', 'Status', 'Time'],
  [CATEGORY_MAP.dataContracts]: ['Data Contract', 'Identity', 'Time'],
  [CATEGORY_MAP.blocks]: ['Block', 'Epoch', 'Time'],
  [CATEGORY_MAP.documents]: ['Document', 'Identity', 'Time'],
  [CATEGORY_MAP.transactions]: ['Transaction', 'Status', 'Time']
}

function ListCategory ({ type, data }) {
  const titles = COLUMN_TITLES[CATEGORY_MAP[type]]
  if (!titles) return null

  return (
    <div className={'SearchResultsList__Category'}>
      <Grid className={'SearchResultsList__ColumnTitles'}>
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
