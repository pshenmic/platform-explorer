'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import * as Api from '../../util/Api'
import { fetchHandlerError, fetchHandlerSuccess, currencyRound, getTokenName } from '../../util'
import ImageGenerator from '../imageGenerator'
import './TokensTrending.scss'

const MIN_PER_HALF = 12

const SECONDS_PER_ITEM = 4.5

function TrendingItem ({ token, rank }) {
  return (
    <Link href={`/token/${token?.tokenIdentifier}`} className={'TokensTrending__Item'}>
      <span className={'TokensTrending__Rank'}>#{rank}</span>
      <ImageGenerator
        className={'TokensTrending__Avatar'}
        username={token?.tokenIdentifier}
        lightness={50}
        saturation={50}
        width={18}
        height={18}
      />
      <span className={'TokensTrending__Name'}>{getTokenName(token?.localizations)}</span>
      <span className={'TokensTrending__Txs'}>{currencyRound(token?.transitionCount)} txs</span>
    </Link>
  )
}

export default function TokensTrending ({ className }) {
  const [tokens, setTokens] = useState({ data: {}, loading: true, error: false })

  useEffect(() => {
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days

    Api.getTokensRating(1, 20, 'desc', {
      timestamp_start: startDate.toISOString(),
      timestamp_end: endDate.toISOString()
    })
      .then(res => fetchHandlerSuccess(setTokens, res))
      .catch(err => fetchHandlerError(setTokens, err))
  }, [])

  const items = tokens?.data?.resultSet || []

  if (tokens.loading || tokens.error || items.length === 0) return null

  const half = []
  while (half.length < MIN_PER_HALF) {
    items.forEach((token, i) => half.push({ token, rank: i + 1 }))
  }
  const track = [...half, ...half]

  return (
    <div className={`TokensTrending ${className || ''}`}>
      <span className={'TokensTrending__Label'}>Trending</span>
      <div className={'TokensTrending__Viewport'}>
        <div
          className={'TokensTrending__Track'}
          style={{ animationDuration: `${half.length * SECONDS_PER_ITEM}s` }}
        >
          {track.map((entry, index) => (
            <TrendingItem token={entry.token} rank={entry.rank} key={index}/>
          ))}
        </div>
      </div>
    </div>
  )
}
