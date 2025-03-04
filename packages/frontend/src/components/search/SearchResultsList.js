// import { Alias, Identifier } from '../data'
// import { Badge, Button } from '@chakra-ui/react'
// import { ChevronIcon } from '../ui/icons'
import './SearchResultsList.scss'
import './SearchResultsListItem.scss'
import SearchResultsListItem from './SearchResultsListItem'

function SearchResultsList ({ results }) {
  console.log('result', results)
  // console.log(JSON.stringify(results))

  return (
    <div className={'SearchResultsList'}>
      {results?.transactions?.length &&
        <div className={'SearchResultsList__Category'}>
          <div className={'SearchResultsList__Title'}>
            {results?.transactions?.length} {results?.transactions?.length > 1 ? 'transactions' : 'transaction'} found
          </div>
          <div>
            {results?.transactions.map((transaction, i) => (
              <SearchResultsListItem
                entity={transaction}
                entityType={'transaction'}
                key={i}
              />
            ))}
          </div>
        </div>
      }

      {results?.validators?.length &&
        <div className={'SearchResultsList__Category'}>
          <div className={'SearchResultsList__Title'}>
            {results?.validators?.length} {results?.validators?.length > 1 ? 'validators' : 'validator'} found
          </div>
          <div>
            {results?.validators.map((validator, i) => (
              <SearchResultsListItem
                entity={validator}
                entityType={'validator'}
                key={i}
              />
            ))}
          </div>
        </div>
      }

      {results?.identities?.length &&
        <div className={'SearchResultsList__Category'}>
          <div className={'SearchResultsList__Title'}>
            {results?.identities?.length} {results?.identities?.length > 1 ? 'identities' : 'identity'} found
          </div>
          <div>
            {results?.identities.map((identity, i) => (
              <SearchResultsListItem
                entity={identity}
                entityType={'identity'}
                key={i}
              />
            ))}
          </div>
        </div>
      }

      {results?.dataContracts?.length &&
        <div className={'SearchResultsList__Category'}>
          <div className={'SearchResultsList__Title'}>
            {results?.dataContracts?.length} {results?.dataContracts?.length > 1 ? 'data contracts' : 'data contract'} found
          </div>
          <div>
            {results?.dataContracts.map((dataContract, i) => (
              <SearchResultsListItem
                entity={dataContract}
                entityType={'datacontract'}
                key={i}
              />
            ))}
          </div>
        </div>
      }
    </div>
  )
}

export default SearchResultsList
