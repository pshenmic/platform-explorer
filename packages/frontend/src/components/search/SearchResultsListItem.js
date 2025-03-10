import {
  BlockSearchItem,
  LoadingSearchItem,
  IdentitySearchItem,
  DataContractSearchItem,
  DocumentSearchItem,
  TransactionSearchItem,
  ValidatorSearchItem
} from './items'
import { ENTITY_TYPES } from './constants'
import './SearchResultsListItem.scss'

function SearchResultsListItem ({ entity, entityType, className }) {
  switch (entityType) {
    case ENTITY_TYPES.BLOCK:
      return <BlockSearchItem block={entity} className={className}/>
    case ENTITY_TYPES.LOADING:
      return <LoadingSearchItem className={className}/>
    case ENTITY_TYPES.TRANSACTION:
      return <TransactionSearchItem transaction={entity} className={className}/>
    case ENTITY_TYPES.IDENTITY:
      return <IdentitySearchItem identity={entity} className={className}/>
    case ENTITY_TYPES.VALIDATOR:
      return <ValidatorSearchItem validator={entity} className={className}/>
    case ENTITY_TYPES.DATA_CONTRACT:
      return <DataContractSearchItem dataContract={entity} className={className}/>
    case ENTITY_TYPES.DOCUMENT:
      return <DocumentSearchItem document={entity} className={className}/>
    default:
      return null
  }
}

export default SearchResultsListItem
