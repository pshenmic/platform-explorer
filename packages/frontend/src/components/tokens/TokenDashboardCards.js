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
    link: `/token/${token?.identifier}`
  })) || Array.from({ length: 6 }, () => ({ loading: true }))

  return (
    <div className={`TokenDashboardCards ${loading ? 'TokenDashboardCards--Loading' : ''} ${className || ''}`}>
      {!error
        ? !loading && (!items || items.length === 0)
            ? <NotActive>No tokens available</NotActive>
            : <DashboardCards cards={cards} columnLayout={[3, 3]}/>
        : <ErrorMessageBlock h={250}/>
      }
    </div>
  )
}

export {
  TokenDashboardCards
}
