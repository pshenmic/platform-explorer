import type { ComponentType, ReactNode } from 'react'
import type { PlatformAddress } from '../../../types'
import type { WithClassName } from '../../../types/common'
// Untyped JS components — loose wrappers until data/* is migrated
import { Identifier as IdentifierJs, NotActive as NotActiveJs } from '../../data'
import { BaseSearchItem } from './BaseSearchItem'

const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  ellipsis?: boolean
  styles?: string[]
}>
const NotActive = NotActiveJs as ComponentType<{ children?: ReactNode }>

interface PlatformAddressSearchItemProps extends WithClassName {
  platformAddress?: Partial<PlatformAddress> | null
  onClick?: (data: unknown) => void
}

export function PlatformAddressSearchItem({
  platformAddress,
  className,
  onClick
}: PlatformAddressSearchItemProps) {
  const address = platformAddress?.bech32mAddress || platformAddress?.base58Address

  return (
    <BaseSearchItem
      href={`/platformAddress/${address}`}
      className={`${className || ''}`}
      gridClassModifier={'PlatformAddress'}
      onClick={onClick}
      data={platformAddress}
    >
      <div className={'SearchResultsListItem__Column'}>
        <Identifier ellipsis={true} styles={['highlight-both']}>
          {address}
        </Identifier>
      </div>
      <div className={'SearchResultsListItem__Column SearchResultsListItem__Column--Additional'}>
        {platformAddress?.totalTxs != null ? (
          <span>{platformAddress.totalTxs} txs</span>
        ) : (
          <NotActive>-</NotActive>
        )}
      </div>
    </BaseSearchItem>
  )
}
