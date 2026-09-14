'use client'

import type { ComponentType, ReactNode } from 'react'
import { DashboardCards as DashboardCardsJs } from '../cards'
import { TokenCardContent as TokenCardContentJs } from '../cards/dashboard'
import { ErrorMessageBlock } from '../Errors'
// Untyped JS components — loose wrappers until data/* is migrated
import { NotActive as NotActiveJs } from '../data'
import type { WithClassName } from '../../types/common'
import './TokenDashboardCards.css'
import './TokenDashboardCard.css'

const NotActive = NotActiveJs as ComponentType<{ children?: ReactNode; className?: string }>
const DashboardCards = DashboardCardsJs as ComponentType<{
  cards?: Array<Record<string, unknown>>
  columnLayout?: number[]
  sliderMode?: string
}>
const TokenCardContent = TokenCardContentJs as ComponentType<{
  token?: Record<string, unknown>
  nullMessage?: string
}>

/** Dashboard token card payload (rating/trending shape). */
export interface DashboardTokenItem {
  tokenIdentifier?: string | null
  [key: string]: unknown
}

interface TokenDashboardCardsProps extends WithClassName {
  items?: DashboardTokenItem[] | null
  error?: boolean
  loading?: boolean
}

function TokenDashboardCards({ items, error, loading, className }: TokenDashboardCardsProps) {
  const cards =
    items?.map(token => ({
      value: <TokenCardContent token={token} />,
      className: 'TokenDashboardCards__Card',
      error: false,
      loading,
      link: `/token/${token?.tokenIdentifier}`
    })) || Array.from({ length: 6 }, () => ({ loading: true }))

  let displayCards = cards
  let columnLayout = [3, 3]

  if (!loading && !error && items && items.length > 0 && items.length < 6) {
    const itemsCount = items.length

    if (itemsCount >= 4) {
      columnLayout = [2, 2]
      displayCards = cards.slice(0, 4)
    } else {
      columnLayout = [itemsCount]
    }
  }

  return (
    <div
      className={`TokenDashboardCards ${loading ? 'TokenDashboardCards--Loading' : ''} ${columnLayout.length === 1 ? 'TokenDashboardCards--SingleColumn' : ''} ${className || ''}`}
    >
      {!error ? (
        !loading && (!items || items.length === 0) ? (
          <NotActive>No tokens available</NotActive>
        ) : (
          <DashboardCards
            cards={displayCards}
            columnLayout={columnLayout}
            sliderMode={columnLayout.length === 1 ? 'never' : 'responsive'}
          />
        )
      ) : (
        <ErrorMessageBlock h={250} />
      )}
    </div>
  )
}

export { TokenDashboardCards }
