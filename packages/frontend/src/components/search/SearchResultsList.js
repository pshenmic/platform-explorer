import './SearchResultsList.scss'
import './SearchResultsListItem.scss'
import SearchResultsListItem from './SearchResultsListItem'

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
  console.log('result', results)
  // console.log(JSON.stringify(results))

  return (
    <div className={'SearchResultsList'}>
      {Object.entries(results).map(([category, items]) => (
        <ListCategory key={category} type={category} data={items}/>
      ))}
    </div>
  )
}

export default SearchResultsList
