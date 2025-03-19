import {
  BlockSearchItem,
  LoadingSearchItem,
  IdentitySearchItem,
  DataContractSearchItem,
  DocumentSearchItem,
  TransactionSearchItem,
  ValidatorSearchItem
} from './items'
import { entityTypes } from './constants'
import './SearchResultsListItem.scss'

function SearchResultsListItem ({ entity, entityType, className }) {
  switch (entityType) {
    case entityTypes.block:
      return <BlockSearchItem block={entity} className={className}/>
    case entityTypes.loading:
      return <LoadingSearchItem className={className}/>
    case entityTypes.transaction:
      return <TransactionSearchItem transaction={entity} className={className}/>
    case entityTypes.identity:
      return <IdentitySearchItem identity={entity} className={className}/>
    case entityTypes.validator:
      return <ValidatorSearchItem validator={entity} className={className}/>
    case entityTypes.dataContract:
      return <DataContractSearchItem dataContract={entity} className={className}/>
    case entityTypes.document:
      return <DocumentSearchItem document={entity} className={className}/>
    default:
      return null
  }
}

export default SearchResultsListItem
