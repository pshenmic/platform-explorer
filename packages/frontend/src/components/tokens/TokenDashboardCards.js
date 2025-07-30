'use client'

import { DashboardCards } from '../cards'
import { TokenCardContent } from '../cards/dashboard'
import { ErrorMessageBlock } from '../Errors'
import { NotActive } from '../data'
import './TokenDashboardCards.scss'
import './TokenDashboardCard.scss'

function TokenDashboardCards ({ items, error, loading, className }) {
  const cards = items?.map(token => ({
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
    <div className={`TokenDashboardCards ${loading ? 'TokenDashboardCards--Loading' : ''} ${columnLayout.length === 1 ? 'TokenDashboardCards--SingleColumn' : ''} ${className || ''}`}>
      {!error
        ? !loading && (!items || items.length === 0)
            ? <NotActive>No tokens available</NotActive>
            : <DashboardCards cards={displayCards} columnLayout={columnLayout} sliderMode={columnLayout.length === 1 ? 'never' : 'responsive'}/>
        : <ErrorMessageBlock h={250}/>
      }
    </div>
  )
}

export {
  TokenDashboardCards
}
