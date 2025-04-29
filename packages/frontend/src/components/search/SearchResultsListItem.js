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

function SearchResultsListItem ({ entity, entityType, className, onClick }) {
  switch (entityType) {
    case entityTypes.loading:
      return <LoadingSearchItem className={className}/>
    case entityTypes.block:
      return <BlockSearchItem block={entity} className={className} onClick={onClick}/>
    case entityTypes.transaction:
      return <TransactionSearchItem transaction={entity} className={className} onClick={onClick}/>
    case entityTypes.identity:
      return <IdentitySearchItem identity={entity} className={className} onClick={onClick}/>
    case entityTypes.validator:
      return <ValidatorSearchItem validator={entity} className={className} onClick={onClick}/>
    case entityTypes.dataContract:
      return <DataContractSearchItem dataContract={entity} className={className} onClick={onClick}/>
    case entityTypes.document:
      return <DocumentSearchItem document={entity} className={className} onClick={onClick}/>
    default:
      return null
  }
}

export default SearchResultsListItem
