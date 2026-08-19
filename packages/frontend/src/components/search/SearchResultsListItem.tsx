import type { WithClassName } from '../../types/common'
import {
  BlockSearchItem,
  LoadingSearchItem,
  IdentitySearchItem,
  DataContractSearchItem,
  DocumentSearchItem,
  TransactionSearchItem,
  ValidatorSearchItem,
  TokenSearchItem,
  PlatformAddressSearchItem
} from './items'
import { entityTypes, type EntityType } from './constants'
import './SearchResultsListItem.scss'

interface SearchResultsListItemProps extends WithClassName {
  entity?: unknown
  entityType?: EntityType | string
  onClick?: (data: unknown) => void
}

function SearchResultsListItem ({ entity, entityType, className, onClick }: SearchResultsListItemProps) {
  switch (entityType) {
    case entityTypes.loading:
      return <LoadingSearchItem className={className}/>
    case entityTypes.block:
      return <BlockSearchItem block={entity as Parameters<typeof BlockSearchItem>[0]['block']} className={className} onClick={onClick}/>
    case entityTypes.transaction:
      return <TransactionSearchItem transaction={entity as Parameters<typeof TransactionSearchItem>[0]['transaction']} className={className} onClick={onClick}/>
    case entityTypes.identity:
      return <IdentitySearchItem identity={entity as Parameters<typeof IdentitySearchItem>[0]['identity']} className={className} onClick={onClick}/>
    case entityTypes.validator:
      return <ValidatorSearchItem validator={entity as Parameters<typeof ValidatorSearchItem>[0]['validator']} className={className} onClick={onClick}/>
    case entityTypes.dataContract:
      return <DataContractSearchItem dataContract={entity as Parameters<typeof DataContractSearchItem>[0]['dataContract']} className={className} onClick={onClick}/>
    case entityTypes.document:
      return <DocumentSearchItem document={entity as Parameters<typeof DocumentSearchItem>[0]['document']} className={className} onClick={onClick}/>
    case entityTypes.token:
      return <TokenSearchItem token={entity as Parameters<typeof TokenSearchItem>[0]['token']} className={className} onClick={onClick}/>
    case entityTypes.platformAddress:
      return <PlatformAddressSearchItem platformAddress={entity as Parameters<typeof PlatformAddressSearchItem>[0]['platformAddress']} className={className} onClick={onClick}/>
    default:
      return null
  }
}

export default SearchResultsListItem
