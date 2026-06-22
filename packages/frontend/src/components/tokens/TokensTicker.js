'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import * as Api from '../../util/Api'
import { fetchHandlerError, fetchHandlerSuccess, currencyRound, getTokenName } from '../../util'
import ImageGenerator from '../imageGenerator'
import './TokensTicker.scss'

function TickerItem ({ token, rank }) {
  return (
    <Link href={`/token/${token?.tokenIdentifier}`} className={'TokensTicker__Item'}>
      <span className={'TokensTicker__Rank'}>#{rank}</span>
      <ImageGenerator
        className={'TokensTicker__Avatar'}
        username={token?.tokenIdentifier}
        lightness={50}
        saturation={50}
        width={18}
        height={18}
      />
      <span className={'TokensTicker__Name'}>{getTokenName(token?.localizations)}</span>
      <span className={'TokensTicker__Txs'}>{currencyRound(token?.transitionCount)} txs</span>
    </Link>
  )
}

export default function TokensTicker () {
  const [tokens, setTokens] = useState({ data: {}, loading: true, error: false })

  useEffect(() => {
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 days

    Api.getTokensRating(1, 10, 'desc', {
      timestamp_start: startDate.toISOString(),
      timestamp_end: endDate.toISOString()
    })
      .then(res => fetchHandlerSuccess(setTokens, res))
      .catch(err => fetchHandlerError(setTokens, err))
  }, [])

  const items = tokens?.data?.resultSet || []

  if (tokens.loading || tokens.error || items.length === 0) return null

  return (
    <div className={'TokensTicker'}>
      <span className={'TokensTicker__Label'}>Trending</span>
      <div className={'TokensTicker__Viewport'}>
        <div className={'TokensTicker__Track'}>
          {items.map((token, index) => (
            <TickerItem token={token} rank={index + 1} key={`a-${index}`}/>
          ))}
          {items.map((token, index) => (
            <TickerItem token={token} rank={index + 1} key={`b-${index}`}/>
          ))}
        </div>
      </div>
    </div>
  )
}
