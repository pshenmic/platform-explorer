import SearchResultsListItem from './SearchResultsListItem'
import './SearchResultsList.scss'

function ListCategory ({ type, data }) {
  const singularCategoryMap = {
    transactions: 'transaction',
    dataContracts: 'dataContract',
    documents: 'document',
    identities: 'identity',
    blocks: 'block',
    validators: 'validator'
  }

  return (
    <div className={'SearchResultsList__Category'}>
      <div className={'SearchResultsList__Title'}>
        {data?.length} {data?.length > 1 ? type : singularCategoryMap[type]} found
      </div>
      <div>
        {data?.map((entity, i) => (
          <SearchResultsListItem
            entity={entity}
            entityType={singularCategoryMap[type]}
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
      {results.loading &&
        <SearchResultsListItem entityType={'loading'}/>
      }

      {results.error &&
        <div className={'SearchResultsList__Title SearchResultsList__Title--NotFound'}>Nothing found</div>
      }

      {results.data && Object?.entries(results.data)?.length > 0 &&
        Object.entries(results.data).map(([category, items]) => (
          <ListCategory key={category} type={category} data={items}/>
        ))
      }
    </div>
  )
}

export default SearchResultsList
