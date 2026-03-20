import { GridItem } from '@chakra-ui/react'
import { Identifier, NotActive } from '../../data'
import { BaseSearchItem } from './BaseSearchItem'

export function PlatformAddressSearchItem ({ platformAddress, className, onClick }) {
  const address = platformAddress?.bech32mAddress || platformAddress?.base58Address

  return (
    <BaseSearchItem
      href={`/platformAddress/${address}`}
      className={`${className || ''}`}
      gridClassModifier={'PlatformAddress'}
      onClick={onClick}
      data={platformAddress}
    >
      <GridItem className={'SearchResultsListItem__Column'}>
        <Identifier ellipsis={true} styles={['highlight-both']}>{address}</Identifier>
      </GridItem>
      <GridItem className={'SearchResultsListItem__Column SearchResultsListItem__Column--Additional'}>
        {platformAddress?.totalTxs != null
          ? <span>{platformAddress.totalTxs} txs</span>
          : <NotActive>-</NotActive>
        }
      </GridItem>
    </BaseSearchItem>
  )
}
